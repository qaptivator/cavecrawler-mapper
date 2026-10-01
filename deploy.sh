#!/usr/bin/env bash
git checkout prod
git merge main
git push origin prod
git checkout main