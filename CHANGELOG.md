**Update v2.10.26**

- Un Compressed all Animations, Models, Entities, and Render Controllers by default
- Removed `compressAssets` function
- Entity Files now generate non compressed
- Added a player ping display to the UI
- Deleted unused broken `white_shaded.json` file
- Updated `en_US` lang file.
    - Removed all `gen\d` translations, as they are unused and take up a lot of space
    - Added missing translations for referenced lang.
    - Fixed some spacing for showdown lang.
- Updated the building system of the production pack
    - Building now ignores `logs` and `missing_info.md`
    - Building now exists immediately if `manifest.json` is not found.
    - Piping is now awaited so it can performing async.
    - Added `addPathToArchive` to handle compressing of json, material, and png files.
    - Improved speed and file logging.
- Added a `removeComments` utility function when compressing json file.
- Properly formatted `scripts/utils.ts`
- Properly formatted `scripts/translate.ts`