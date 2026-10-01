const period = 8
const unitModifier = 24 * 60 * 60 * 4
const IMAGE_CONT_WIDTH = 720
const IMAGE_CONT_HEIGHT = 400

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
Element.prototype.on = function (v, h) {
	this.addEventListener(v, h)
	return this
}
function createStore(prefix = 'cavecrawler_') {
	return new Proxy(
		{},
		{
			get(target, prop) {
				const item = localStorage.getItem(prefix + String(prop))
				if (item === null) return undefined
				try {
					return JSON.parse(item)
				} catch {
					return item
				}
			},
			set(target, prop, value) {
				localStorage.setItem(prefix + String(prop), JSON.stringify(value))
				return true
			},
			deleteProperty(target, prop) {
				localStorage.removeItem(prefix + String(prop))
				return true
			},
		}
	)
}

const store = createStore()
if (store.rotateState === undefined) store.rotateState = 1
if (store.showFuture === undefined) store.showFuture = false
if (store.hideVideo === undefined) store.hideVideo = false
if (store.seasonalTheme === undefined) store.seasonalTheme = true

let cycleOffset = 0
let currentCycle = -1
const text = $('#path-title')
const countdown = $('#path-footer')
const image = $('#path-image')
const imageContainer = $('#path-image-container')
const video = $('#path-video')
const offsetUp = $('#offset-up')
const offsetDown = $('#offset-down')
const offsetInfo = $('#offset-info')
const rotateImage = $('#rotate-image')
const showFutureCheckbox = $('#settings-showfuture')
const hideVideoCheckbox = $('#settings-hidevideo')
const seasonalThemeCheckbox = $('#settings-seasonaltheme')

function updateRotateImage() {
	const isVertical = store.rotateState % 2 !== 0
	const angle = store.rotateState * 90

	if (isVertical) {
		imageContainer.style.width = IMAGE_CONT_HEIGHT + 'px'
		imageContainer.style.height = IMAGE_CONT_WIDTH + 'px'

		image.style.width = IMAGE_CONT_WIDTH + 'px'
		image.style.height = IMAGE_CONT_HEIGHT + 'px'
	} else {
		imageContainer.style.width = IMAGE_CONT_WIDTH + 'px'
		imageContainer.style.height = IMAGE_CONT_HEIGHT + 'px'

		image.style.width = IMAGE_CONT_WIDTH + 'px'
		image.style.height = IMAGE_CONT_HEIGHT + 'px'
	}

	image.style.transform = `rotate(${angle}deg)`
}

function secondsToDhms(seconds) {
	seconds = Number(seconds)
	const d = Math.floor(seconds / (3600 * 24))
	const h = Math.floor((seconds % (3600 * 24)) / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)
	const dDisplay = d > 0 ? d + (d == 1 ? ' day' : ' days') : ''
	const hDisplay = h > 0 ? h + (h == 1 ? ' hour' : ' hours') : ''
	const mDisplay = m > 0 ? m + (m == 1 ? ' minute' : ' minutes') : ''
	const sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''
	const unfiltered = [dDisplay, hDisplay, mDisplay, sDisplay]
	const filtered = unfiltered.filter((v) => v != null && v != '')
	return filtered.join(', ')
}

function getTime() {
	return Math.floor(Date.now() / 1000) + cycleOffset * unitModifier
}

function timeUntilNextCycle() {
	let time = getTime()
	return unitModifier - (time % unitModifier)
}

function getCycle() {
	let time = getTime()
	return Math.floor((time % (period * unitModifier)) / unitModifier)
}

function updateTimer() {
	countdown.textContent = `Refreshes in ${secondsToDhms(timeUntilNextCycle())}`
}

function updatePath() {
	applyShowFutureSetting()

	const cycle = getCycle()
	offsetInfo.textContent = cycleOffset

	if (cycle === 5) {
		text.innerHTML =
			'The Maze is currently closed.<br>You cannot get to cavecrawler wood because all of the doors are blocked.<br>Check again later!'
	} else {
		text.textContent = 'Current path to cavecrawler wood:'
	}

	if (cycleOffset > 0) {
		text.textContent = `Path to cavecrawler wood ${Math.abs(
			cycleOffset * 4
		)} days from now:`
	}
	if (cycleOffset < 0) {
		text.textContent = `Path to cavecrawler wood ${Math.abs(
			cycleOffset * 4
		)} days ago:`
	}

	applyHideVideoSetting(cycle)

	if (cycle === currentCycle) return
	currentCycle = cycle

	switch (cycle) {
		case 0:
			image.src = 'assets/Path0.png'
			video.src = 'https://www.youtube.com/embed/P8m3efuHMho'
			break
		case 1:
			image.src = 'assets/Path1.png'
			video.src = 'https://www.youtube.com/embed/l7qKew_Or6M'
			break
		case 2:
			image.src = 'assets/Path2.png'
			video.src = 'https://www.youtube.com/embed/DuB4s7N9X8w'
			break
		case 3:
			image.src = 'assets/Path3.png'
			video.src = 'https://www.youtube.com/embed/orMRs5U2zlY'
			break
		case 4:
			image.src = 'assets/Path4.png'
			video.src = 'https://www.youtube.com/embed/fly1fR4HlS4'
			break
		case 5:
			image.src = 'assets/Path5_Blocked.png'
			break
		case 6:
			image.src = 'assets/Path6.png'
			video.src = 'https://www.youtube.com/embed/XEda9jvCZI4'
			break
		case 7:
			image.src = 'assets/Path7.png'
			video.src = 'https://www.youtube.com/embed/t8oRKTtcJwk'
			break
		default:
			alert('Unexpected error occurred, maze cycle not found.')
			return
	}
}

function applyShowFutureSetting() {
	showFutureCheckbox.checked = store.showFuture

	if (!store.showFuture && cycleOffset >= 0) {
		cycleOffset = 0
		offsetUp.classList.add('hidden')
	} else {
		offsetUp.classList.remove('hidden')
	}
}

function applyHideVideoSetting(cycle = getCycle()) {
	hideVideoCheckbox.checked = store.hideVideo

	if (store.hideVideo || cycle === 5) {
		video.classList.add('hidden')
	} else {
		video.classList.remove('hidden')
	}
}

function applySeasonalThemeSetting() {
	seasonalThemeCheckbox.checked = store.seasonalTheme

	if (store.seasonalTheme) {
		document.body.classList.add('seasonal-theme')
	} else {
		document.body.classList.remove('seasonal-theme')
	}
}

offsetUp.on('click', () => {
	if (!store.showFuture && cycleOffset >= 0) return
	cycleOffset += 1
	updatePath()
	updateTimer()
})

offsetDown.on('click', () => {
	cycleOffset -= 1
	updatePath()
	updateTimer()
})

showFutureCheckbox.on('change', (e) => {
	store.showFuture = e.target.checked
	updatePath()
	updateTimer()
})

hideVideoCheckbox.on('change', (e) => {
	store.hideVideo = e.target.checked
	applyHideVideoSetting()
})

seasonalThemeCheckbox.on('change', (e) => {
	store.seasonalTheme = e.target.checked
	applySeasonalThemeSetting()
})

// App Start Initialization
const yearEl = $('#current-year')
if (yearEl) yearEl.innerHTML = new Date().getFullYear()

imageContainer.style.width = IMAGE_CONT_WIDTH + 'px'
imageContainer.style.height = IMAGE_CONT_HEIGHT + 'px'
updateRotateImage()

rotateImage.on('click', () => {
	store.rotateState = (store.rotateState + 1) % 4
	updateRotateImage()
})

applySeasonalThemeSetting()
updatePath()
updateTimer()

setInterval(() => {
	updateTimer()
	updatePath()
}, 1000)
