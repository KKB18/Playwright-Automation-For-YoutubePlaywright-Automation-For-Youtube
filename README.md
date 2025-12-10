# Playwright YouTube Automation Testing Framework

A comprehensive Playwright-based test automation framework for YouTube video validation, featuring custom reporting with detailed test metrics, screenshots, and validation checkpoints.

## 📋 Project Overview

This framework automates the testing of YouTube video search and playback functionality with the following capabilities:
- Automated video search and validation
- Video metadata verification (title, thumbnail, duration)
- Video sharing functionality testing
- Detailed execution reports with screenshots
- Custom HTML dashboard with real-time metrics

## 🎯 Test Coverage

Each test validates the following actions:

### 1. Navigation & Search
- Navigate to YouTube homepage
- Verify page load completion
- Search for video by title
- Validate search input

### 2. Search Results Validation
- Verify video appears in search results
- Check video title matches expected value
- Validate video thumbnail image URL
- Confirm video duration

### 3. Video Page Verification
- Click on video and navigate to video page
- Verify page title matches video title
- Confirm correct video URL

### 4. Share Functionality
- Click the Share button
- Verify share dialog appears
- Click Copy button
- Validate clipboard notification

## 📁 Project Structure

```
playwright/
├── tests/
│   ├── youTube.spec.ts                 # Main test specification file
│   └── youTube.spec.ts-snapshots/      # Visual snapshot comparisons
├── pom/
│   ├── youtubeSearchPage.ts            # YouTube Search page object model
│   └── youtubeVideoPage.ts             # YouTube Video page object model
├── Utilities/
│   ├── custom-reporter.js              # Custom HTML report generator
│   └── ScreenShot.ts                   # Screenshot capture utility
├── test-Data/
│   └── videoData.json                  # Test data (video details)
├── test-results/                       # Generated test reports
│   ├── report.json                     # Playwright JSON report
│   ├── report.xml                      # JUnit XML report
│   ├── customReport.html               # Custom HTML report (generated)
│   ├── index.html                      # Playwright HTML report
│   └── data/                           # Report assets
├── playwright.config.ts                # Playwright configuration
├── package.json                        # Dependencies
└── README.md                           # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playwright
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

## 🧪 Running Tests

### Run all tests
```bash
npx playwright test
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run specific test file
```bash
npx playwright test youTube.spec.ts
```

### Run tests with UI mode
```bash
npx playwright test --ui
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

## 📊 Reports

### Custom HTML Report
After running tests, open the custom report:
```
test-results/customReport.html
```

**Features:**
- 📈 Pie chart showing test distribution (Passed/Failed/Skipped)
- 📊 Summary statistics with success rate
- 📋 Detailed test table with:
  - Test ID and title
  - Execution status
  - Duration
  - Step validations (✅/❌)
  - Screenshot gallery
  - **Expandable Details** showing all validation checkpoints

### Playwright HTML Report
```bash
npx playwright show-report
```

### JUnit XML Report
Located at: `test-results/report.xml`

Perfect for CI/CD integration with Jenkins, Azure DevOps, etc.

## 📸 Screenshots & Validations

### Custom Report Details View
Click the **"📋 Details"** button on any test row to expand and see:
- ✅ All passed validations
- ❌ All failed validations and errors
- Step-by-step execution flow

### Screenshot Gallery
Click the **"📸 View"** button to see:
- Captured screenshots from each test step
- Full-screen view option
- Organized by checkpoint (After Search, Before Share, etc.)

## 📝 Test Data

Test data is located in `test-Data/videoData.json`:

```json
[
  {
    "TCID": "TCID001",
    "Title": "Video Title | Channel Name",
    "URL": "https://www.youtube.com/watch?v=VIDEO_ID",
    "ImgUrl": "https://i.ytimg.com/vi/VIDEO_ID/hq720.jpg?...",
    "Duration": "2:29"
  }
]
```

## 🛠️ Configuration

### Playwright Config (`playwright.config.ts`)

**Key settings:**
- **Browsers**: Chromium (Desktop - 1920x1080)
- **Timeout**: 30 seconds per test
- **Expect Timeout**: 10 seconds
- **Workers**: 1 (sequential execution)
- **Retries**: 0 on local, 1 on CI
- **Traces**: Captured on first retry

### Custom Reporters

Three reporters are configured:

1. **List Reporter** - Console output
2. **HTML Reporter** - Playwright standard report
3. **JSON Reporter** - Machine-readable format
4. **JUnit Reporter** - CI/CD integration
5. **Custom Reporter** - Stakeholder-friendly HTML dashboard

## 🔍 Page Object Models (POM)

### YouTubeSearchPage
**Locators & Methods:**
- `navigateAndVerifyLoad(url)` - Navigate and verify page load
- `searchForVideo(title)` - Search for video by title
- `checkFirstVideoTitle(expectedTitle)` - Validate first result title
- `checkFirstVideoDuration(expectedDuration)` - Validate video duration
- `checkFirstVideoThumbnailUrl(expectedUrl)` - Validate thumbnail
- `clickFirstVideo()` - Click first search result

### YouTubeVideoPage
**Locators & Methods:**
- `verifyVideoPageLoaded(title)` - Verify video page loads with title
- `verifyVideoURL(expectedURL)` - Verify correct video URL
- `openShareDialog()` - Open share dialog
- `copyLinkAndVerifyClipboardMessage()` - Copy link and verify notification

## 🎭 Test Execution Flow

```
1. Navigate to YouTube
   ↓
2. Search for video by title
   ↓
3. Verify search results:
   - Check title visibility
   - Validate thumbnail URL
   - Confirm duration
   ↓
4. Click video to open
   ↓
5. Verify video page:
   - Check title matches
   - Validate URL
   ↓
6. Test sharing:
   - Open share dialog
   - Copy link
   - Verify clipboard message
   ↓
7. Capture screenshots at each step
   ↓
8. Report results with detailed metrics
```

## 📊 Report Structure

### Summary Statistics
- **Total Tests**: Count of all tests
- **Passed**: Count of successful tests
- **Failed**: Count of failed tests
- **Skipped**: Count of skipped tests
- **Success Rate**: Percentage of passed tests

### Test Table Columns
| Column | Description |
|--------|-------------|
| Test ID | Unique identifier |
| Test Title | Test name with TCID |
| Status | PASSED / FAILED / SKIPPED |
| Duration | Execution time in seconds |
| Video Search Validations | ✅/❌ step status |
| Screenshots | View captured images |
| Details | Expand for all validations |

## 🐛 Troubleshooting

### Tests Fail with "Element not found"
- YouTube DOM structure may have changed
- Update locators in POM files
- Check browser compatibility

### Screenshot Comparisons Fail
- Dynamic content may vary
- Use `--update-snapshots` flag to update baselines
```bash
npx playwright test --update-snapshots
```

### Timeout Issues
- Increase timeout in playwright.config.ts
- Check network connectivity
- Verify YouTube is accessible

### Custom Report Not Generated
- Check if `test-results/report.json` exists
- Verify custom-reporter.js path in playwright.config.ts
- Check console for reporter errors

## 📚 Dependencies

```json
{
  "@playwright/test": "^1.57.0",
  "@types/node": "^24.10.1"
}
```

## 🔐 Best Practices

1. **Use Page Object Models** - Encapsulate locators and methods
2. **Descriptive Test Names** - Include TCID and action description
3. **Explicit Waits** - Use Playwright's built-in waiting mechanisms
4. **Screenshot Capture** - Document each key step
5. **Error Logging** - Log detailed errors for debugging
6. **Test Data Separation** - Keep test data in JSON files
7. **Meaningful Assertions** - Validate business requirements

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Install dependencies
  run: npm install

- name: Run tests
  run: npx playwright test

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: test-results/
```

### Jenkins Example
```groovy
stage('Run Tests') {
    steps {
        sh 'npm install'
        sh 'npx playwright test'
    }
}

stage('Archive Report') {
    steps {
        junit 'test-results/report.xml'
        archiveArtifacts artifacts: 'test-results/customReport.html'
    }
}
```

## 📞 Support & Contributing

For issues, feature requests, or contributions:
1. Create an issue with detailed description
2. Provide screenshots/logs
3. Submit PR with clear commit messages

## 📄 License

[Your License Here]

## 👤 Author

Created for Schneider Electric YouTube automation testing

---

**Last Updated**: December 2025  
**Version**: 1.0.0
