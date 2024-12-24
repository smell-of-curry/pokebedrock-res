**Update v2.12.5**

- The Testing Workflow will now use the latest node-version when running tests.
- Renamed Armarouge Christmas animation file, as Christmas was spelled wrong.
- Removed unused Gardevoir Mega Animation
- Changed Floating Text Texture Name to be a proper `_spawn_egg` name.
- Fixed the Leaders Crest `items.json` icon id.
- Updated `scripts/removeUnusedFiles.ts`:
    - Now when asking if you want to delete, it will give you proper path.
    - It will now loop through `textures/item_textures.json` to ensure all is used.
- `scripts/tests/verifyItemIcons` now does extra verification to ensure the file referenced in the icon id path exists.
- Fixed & Removed a ton of icons, to fix displays of items.
- Merge pull request #87 from TheblueJo/main, which updates de_DE and en_ES.