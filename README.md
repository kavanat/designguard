# UX Linter Browser Extension

A browser extension that detects UX violations in real-time for web applications. This extension helps developers and designers identify common UX issues such as small button sizes, low color contrast, and excessive CTAs.

## Features

- Real-time UX violation detection
- Highlights issues directly on the page
- Detailed violation reporting in popup
- Support for multiple violation types:
  - Button size violations
  - Color contrast issues
  - Excessive CTAs
- Real-time updates as page content changes

## Installation

1. Clone this repository:
   ```bash
   git clone [repository-url]
   cd ux-linter-extension
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `src` directory

## Usage

1. Click the extension icon in your browser toolbar to open the popup
2. The extension will automatically scan the current page for UX violations
3. Violations will be highlighted on the page and listed in the popup
4. Use the "Refresh" button to rescan the page
5. Use the "Clear Highlights" button to remove the violation highlights

## Violation Types

### Button Size
- Detects buttons smaller than 100px in width or 40px in height
- Helps ensure buttons are easily clickable

### Color Contrast
- Checks text color contrast against background
- Ensures text is readable for all users
- Minimum contrast ratio: 4.5:1

### CTA Count
- Flags pages with more than 3 calls-to-action
- Helps maintain a clear user journey

## Development

### Project Structure
```
src/
├── manifest.json     # Extension configuration
├── content.js       # Content script for violation detection
├── content.css      # Styles for violation highlights
├── popup.html       # Popup interface
├── popup.js         # Popup functionality
└── popup.css        # Popup styles
```

### Building
No build step is required. The extension can be loaded directly from the `src` directory.

### Testing
1. Load the extension in Chrome
2. Visit various websites to test violation detection
3. Check the popup for violation reports
4. Verify that highlights appear correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details 