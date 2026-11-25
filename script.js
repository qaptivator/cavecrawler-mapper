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
			'The Maze is <span class="text-contrast">currently closed.</span><br>You cannot get to cavecrawler wood,<br>because all of the doors are blocked.<br>Check again later!'
	} else {
		text.innerHTML = 'Current path to cavecrawler wood:'
	}

	if (cycleOffset > 0) {
		text.innerHTML = `Path to cavecrawler wood <span class="text-contrast">${Math.abs(
			cycleOffset * 4
		)} days</span> from now:`
	}
	if (cycleOffset < 0) {
		text.innerHTML = `Path to cavecrawler wood <span class="text-contrast">${Math.abs(
			cycleOffset * 4
		)} days</span> ago:`
	}

	applyHideVideoSetting(cycle)

	if (cycle === currentCycle) return
	currentCycle = cycle

	switch (cycle) {
		case 0:
			image.src = 'assets/Path0.png'
			video.src = 'https://www.youtube.com/embed/fly1fR4HlS4'
			break
		case 1:
			image.src = 'assets/Path1.png'
			video.src = 'https://www.youtube.com/embed/t8oRKTtcJwk'
			break
		case 2:
			image.src = 'assets/Path2.png'
			video.src = 'https://www.youtube.com/embed/XEda9jvCZI4'
			break
		case 3:
			image.src = 'assets/Path3.png'
			video.src = 'https://www.youtube.com/embed/orMRs5U2zlY'
			break
		case 4:
			image.src = 'assets/Path4.png'
			video.src = 'https://www.youtube.com/embed/DuB4s7N9X8w'
			break
		case 5:
			image.src = 'assets/Path5_Blocked.png'
			break
		case 6:
			image.src = 'assets/Path6.png'
			video.src = 'https://www.youtube.com/embed/l7qKew_Or6M'
			break
		case 7:
			image.src = 'assets/Path7.png'
			video.src = 'https://www.youtube.com/embed/P8m3efuHMho'
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

if (!Array.isArray(store.dismissedNotices)) {
	store.dismissedNotices = []
}

const NOTICES = [
	{
		id: '6d24c317-1c23-4f3d-8635-a5feaec9f12a',
		content:
			'The video guides have been fixed: they point to the correct path now. Sorry for the inconvenience!',
		expiresAt: '2026-12-15T23:59:59Z',
	},
]

function isNoticeExpired(expiresAt) {
	if (!expiresAt) return false
	const targetMs =
		typeof expiresAt === 'number' ? expiresAt : Date.parse(expiresAt)
	if (Number.isNaN(targetMs)) return false
	return Date.now() >= targetMs
}

function getActiveNotices() {
	const dismissed = new Set(store.dismissedNotices)
	return NOTICES.filter(
		(notice) =>
			notice &&
			typeof notice.id === 'string' &&
			!dismissed.has(notice.id) &&
			!isNoticeExpired(notice.expiresAt)
	)
}

function dismissNotice(id) {
	const dismissed = new Set(store.dismissedNotices)
	dismissed.add(id)
	store.dismissedNotices = [...dismissed]
	renderNextNotice()
}

function renderNextNotice() {
	const container = $('#notices-container')
	if (!container) return

	const [current] = getActiveNotices()
	if (!current) {
		container.replaceChildren()
		return
	}

	const card = document.createElement('div')
	card.className =
		'my-3 flex w-full cursor-pointer select-none items-start justify-between gap-3 rounded-lg border border-amber-400/40 bg-amber-400/15 px-3.5 py-3 text-left text-sm leading-relaxed text-amber-50 transition duration-200 hover:bg-amber-400/20 sm:px-4'

	const message = document.createElement('p')
	message.className = 'm-0 min-w-0 flex-1'
	message.innerHTML = current.content

	const closeIcon = document.createElement('span')
	closeIcon.setAttribute('aria-hidden', 'true')
	closeIcon.className =
		'-mr-1 -mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-amber-200/80 transition duration-200'
	closeIcon.innerHTML = `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-4 w-4"
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	`

	card.on('click', () => dismissNotice(current.id))
	card.append(message, closeIcon)
	container.replaceChildren(card)
}

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
renderNextNotice()

setInterval(() => {
	updateTimer()
	updatePath()
}, 1000)
