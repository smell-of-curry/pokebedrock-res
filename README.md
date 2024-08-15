# PokeBedrock Resource Pack

Welcome to the PokeBedrock Resource Pack repository! This resource pack is designed for the Minecraft Bedrock server, PokeBedrock. It allows users to easily download, fix bugs, change textures, and modify the server's appearance.

## Contributing

We welcome contributions to the PokeBedrock Resource Pack! Here's how you can contribute:

### Adding or Changing Translations

1. **Navigate to the Texts Directory**:

   - Go to [PokeBedrock Texts Directory](https://github.com/smell-of-curry/pokebedrock-res/tree/main/texts).

2. **Download the Base Language File**:

   - Download the `en_US.lang` file from [here](https://github.com/smell-of-curry/pokebedrock-res/blob/main/texts/en_US.lang).

3. **Rename the File**:

   - Rename the file based on your language using the file names listed in [language_names.json](https://github.com/smell-of-curry/pokebedrock-res/blob/main/texts/language_names.json). For example, `Português (Portugal)` would be `pt_PT`.

4. **Translate the Content**:

   - Convert the text in the `en_US.lang` file to your desired language.

5. **Upload Your Translated File**:

   - Go back to the [Texts Directory](https://github.com/smell-of-curry/pokebedrock-res/tree/main/texts) and click `Add File` -> `Upload Files`.
   - Upload your translated file.

6. **Commit Your Changes**:

   - Name your commit something descriptive, like "Added translation for Portuguese (Portugal)".

7. **Submit a Pull Request**:
   - Submit a pull request with your changes.

### Advanced

If you have node installed, you can install dependencies by running

```
npm i
```

And then translate 25% of source strings using

```
npm run translate <language>
```
