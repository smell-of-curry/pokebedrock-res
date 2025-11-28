## PHUD Helpers

All helpers are now imported directly from `mcbe-ts-ui`:

### Visibility Bindings

```typescript
import { phudVisibility, phudText } from "mcbe-ts-ui";

// Standard PHUD visibility pattern (fetch + show if not empty)
panel("main").bindings(...phudVisibility("#fake_actionbar"));

// Label with PHUD text binding
const myLabel = phudText(
  label("display").anchor("center").color("$color"),
  "#player_ping_text"
);
```

### String Parsing

Bedrock UI uses C printf-style format specifiers for string manipulation:

```typescript
import {
  first,
  skip,
  slice,
  strip,
  firstStripped,
  skipStripped,
  prefix,
  notEmpty,
  contains,
} from "mcbe-ts-ui";

// Get first 80 characters
first(80, "#prop"); // "%.80s * #prop"

// Skip first 80 characters
skip(80, "#prop"); // "(#prop - (%.80s * #prop))"

// Get substring (skip 4, take 8)
slice(4, 8, "#prop"); // "%.8s * (#prop - (%.4s * #prop))"

// Strip underscore separator
strip(first(80, "#prop")); // "((%.80s * #prop) - '_')"

// Compound helpers
firstStripped(80, "#prop"); // First 80 chars, strip underscore
skipStripped(80, "#prop"); // After 80 chars, strip underscore

// Conditionals
prefix(4, "#text", "cht:"); // Check if starts with "cht:"
notEmpty("#prop"); // "(not (#prop = ''))"
contains("#text", "search"); // Check if contains substring
```

### Binding Helpers

```typescript
import {
  collectionBinding,
  viewBinding,
  globalBinding,
  factoryBindings,
  buttonFlagVisibility,
} from "mcbe-ts-ui";

// Collection binding for form buttons
collectionBinding("#form_button_text");

// View binding for computed properties
viewBinding("(#health > 0)", "#visible");

// Global binding
globalBinding("#form_text", "#text");

// Factory bindings
factoryBindings();

// Button visibility by flag
buttonFlagVisibility("btn:search", "form_buttons");
```
