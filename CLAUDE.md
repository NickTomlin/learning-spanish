# Working in this repo

See `README.md` for the sheet model and how the pages fit together.

## Don't over-optimize

This is a static study site with a handful of small data files, served to one
reader. Optimize for how obvious the code is, not for how fast it loads.

Don't reach for lazy imports, code splitting, caching layers, memoization, or
bundle-size tricks. They buy nothing measurable here and they cost real
clarity — lazy-loading the sheets, for example, meant duplicating every sheet
title into the registry just so a picker could be drawn without importing the
data. Eager imports made that duplication disappear.

If performance ever genuinely matters, add a build step then. Until something
is actually slow, prefer the plain version.
