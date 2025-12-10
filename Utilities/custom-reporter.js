const fs = require('fs');
const path = require('path');

class CustomReporter {
  onEnd(result) {
    const reportJsonPath = path.join('test-results', 'report.json');
    const customReportPath = path.join('test-results', 'customReport.html');

    if (!fs.existsSync(reportJsonPath)) {
      console.error(`❌ Report JSON not found at ${reportJsonPath}`);
      return;
    }

    try {
      const reportData = JSON.parse(fs.readFileSync(reportJsonPath, 'utf-8'));
      const htmlContent = this.generateHTML(reportData);
      
      fs.writeFileSync(customReportPath, htmlContent, 'utf-8');
      console.log(`\n✅ Custom report generated: ${customReportPath}`);
    } catch (error) {
      console.error(`❌ Error generating custom report:`, error.message);
    }
  }

  generateHTML(reportData) {
    // Collect all test data
    let allTests = [];
    let passedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    reportData.suites.forEach((suite, suiteIdx) => {
      suite.specs.forEach((spec, specIdx) => {
        spec.tests.forEach((test, testIdx) => {
          const result = test.results[0];
          const status = result.status;

          if (status === 'passed') passedCount++;
          else if (status === 'failed') failedCount++;
          else if (status === 'skipped') skippedCount++;

          // Extract steps
          const steps = [];
          if (result.steps && result.steps.length > 0) {
            result.steps.forEach(step => {
              steps.push({
                title: step.title,
                status: status === 'passed' ? 'passed' : 'failed',
                duration: step.duration || 0
              });
            });
          }

          // Extract console logs as validations/actions
          const validations = [];
          
          // Capture stdout logs
          if (result.stdout && result.stdout.length > 0) {
            result.stdout.forEach(log => {
              const text = log.text.trim();
              if (text.startsWith('✅')) {
                validations.push({
                  type: 'pass',
                  message: text.replace('✅ ', '').replace(/\n$/, '')
                });
              } else if (text.startsWith('❌')) {
                validations.push({
                  type: 'fail',
                  message: text.replace('❌ ', '').replace(/\n$/, '')
                });
              }
            });
          }

          // Also capture stderr logs (errors are logged here)
          if (result.stderr && result.stderr.length > 0) {
            result.stderr.forEach(log => {
              const text = log.text.trim();
              if (text.startsWith('❌') || text.startsWith('ERROR in') || text.includes('Error')) {
                // Extract the error message
                const errorMessage = text.replace(/^❌ /, '').replace(/^ERROR in /, '').replace(/\n$/, '');
                if (!validations.some(v => v.message === errorMessage)) {
                  validations.push({
                    type: 'fail',
                    message: errorMessage
                  });
                }
              }
            });
          }

          // If test failed but no validations captured, add a generic failure message
          if (status === 'failed' && validations.length === 0) {
            validations.push({
              type: 'fail',
              message: result.error?.message || 'Test failed'
            });
          }

          // Collect screenshots
          const screenshots = {};
          if (result.attachments && result.attachments.length > 0) {
            result.attachments.forEach(att => {
              if (att.contentType === 'image/png' && att.body) {
                screenshots[att.name] = `data:${att.contentType};base64,${att.body}`;
              }
            });
          }

          const testID = `${suite.file.replace('.ts', '')}-${suiteIdx}-${specIdx}-${testIdx}`;

          allTests.push({
            id: testID,
            title: spec.title,
            status: status,
            duration: result.duration,
            steps: steps,
            validations: validations,
            screenshots: screenshots,
            startTime: result.startTime,
            suite: suite.file,
            specID: spec.id
          });
        });
      });
    });

    const totalTests = allTests.length;
    const successRate = totalTests > 0 ? ((passedCount / totalTests) * 100).toFixed(1) : 0;

    // Get unique steps
    const allSteps = new Set();
    allTests.forEach(test => {
      test.steps.forEach(step => allSteps.add(step.title));
    });
    const stepTitles = Array.from(allSteps);

    // Build table rows HTML
    let tableRowsHTML = '';
    allTests.forEach((test, idx) => {
      const durationSeconds = (test.duration / 1000).toFixed(2);
      const screenshotCount = Object.keys(test.screenshots).length;
      const statusClass = `status-${test.status}`;
      const reportLink = `../test-results/index.html?t=${test.startTime.slice(0, 19).replace(/[:-]/g, '')}`;

      tableRowsHTML += `<tr>
        <td class="test-id">${this.escapeHtml(test.id)}</td>
        <td><a class="test-title" href="${reportLink}" target="_blank" title="Open full test report">${this.escapeHtml(test.title)}</a></td>
        <td style="text-align: center;"><span class="status-badge ${statusClass}">${test.status.toUpperCase()}</span></td>
        <td class="duration-cell">${durationSeconds}s</td>`;

      // Add step columns
      stepTitles.forEach(stepTitle => {
        const step = test.steps.find(s => s.title === stepTitle);
        const stepStatus = step ? step.status : 'skipped';
        const icon = stepStatus === 'passed' ? '✅' : stepStatus === 'failed' ? '❌' : '⊘';
        const stepClass = stepStatus === 'passed' ? 'step-pass' : stepStatus === 'failed' ? 'step-fail' : '';
        tableRowsHTML += `<td class="step-column ${stepClass}">${icon}</td>`;
      });

      // Screenshot button
      if (screenshotCount > 0) {
        tableRowsHTML += `<td class="screenshots-cell"><button class="screenshot-btn" onclick="showScreenshots(${idx}, '${this.escapeHtml(test.title)}')">📸 View (${screenshotCount})</button></td>`;
      } else {
        tableRowsHTML += '<td class="screenshots-cell"><button class="screenshot-btn no-images" disabled>N/A</button></td>';
      }
      
      // Details button to show validations
      tableRowsHTML += `<td class="details-cell"><button class="details-btn" onclick="toggleValidations(${idx})">📋 Details</button></td>`;
      tableRowsHTML += '</tr>';

      // Add validation details row
      if (test.validations && test.validations.length > 0) {
        tableRowsHTML += `<tr class="validation-row" id="validations-${idx}" style="display:none;">
          <td colspan="${4 + stepTitles.length + 2}" class="validation-details">
            <div class="validations-container">
              <h4>Detailed Checks:</h4>
              <ul class="validation-list">`;
        
        test.validations.forEach(validation => {
          const icon = validation.type === 'pass' ? '✅' : '❌';
          const className = validation.type === 'pass' ? 'validation-pass' : 'validation-fail';
          tableRowsHTML += `<li class="${className}">${icon} ${this.escapeHtml(validation.message)}</li>`;
        });

        tableRowsHTML += `</ul>
            </div>
          </td>
        </tr>`;
      }
    });

    // Build step headers HTML
    let stepHeadersHTML = '';
    stepTitles.forEach(stepTitle => {
      stepHeadersHTML += `<th style="text-align: center; min-width: 120px;">${this.escapeHtml(stepTitle)}</th>`;
    });

    // Embed tests data as JSON
    const testsDataJSON = JSON.stringify(allTests);

    // Build complete HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Playwright Stakeholder Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }

        .container {
            max-width: 1400px;
            margin: auto;
        }

        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
            font-size: 2.5em;
        }

        .summary-stats {
            text-align: center;
            margin: 20px 0;
            font-size: 1.1em;
        }

        .stat-item {
            display: inline-block;
            margin: 0 20px;
        }

        .stat-label {
            color: #666;
            font-weight: 500;
        }

        .stat-value {
            font-size: 1.8em;
            font-weight: bold;
            margin-top: 5px;
        }

        .stat-passed { color: #28a745; }
        .stat-failed { color: #dc3545; }
        .stat-skipped { color: #ffc107; }

        .charts-container {
            display: flex;
            justify-content: center;
            gap: 50px;
            margin: 40px 0;
            flex-wrap: wrap;
        }

        .chart-box {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            flex: 0 1 400px;
        }

        .chart-box h3 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }

        #resultsPieChart {
            max-width: 100%;
        }

        .table-wrapper {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            margin-top: 40px;
            overflow-x: auto;
        }

        .table-title {
            background-color: #007bff;
            color: white;
            padding: 20px;
            font-size: 1.3em;
            font-weight: bold;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            background-color: #0056b3;
            color: white;
            font-weight: bold;
        }

        th {
            padding: 15px;
            text-align: left;
            border-bottom: 2px solid #ddd;
            font-size: 0.95em;
        }

        td {
            padding: 15px;
            border-bottom: 1px solid #eee;
        }

        tbody tr:hover {
            background-color: #f8f9fa;
            transition: background-color 0.3s ease;
        }

        tbody tr:nth-child(even) {
            background-color: #fafbfc;
        }

        .test-id {
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            color: #666;
            word-break: break-all;
        }

        .test-title {
            font-weight: 600;
            color: #007bff;
            text-decoration: none;
            cursor: pointer;
        }

        .test-title:hover {
            text-decoration: underline;
            color: #0056b3;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
            text-align: center;
            min-width: 90px;
        }

        .status-passed {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .status-failed {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .status-skipped {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }

        .step-column {
            text-align: center;
            font-size: 1.5em;
            min-width: 60px;
        }

        .step-pass {
            color: #28a745;
        }

        .step-fail {
            color: #dc3545;
        }

        .duration-cell {
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }

        .screenshots-cell {
            text-align: center;
        }

        .details-cell {
            text-align: center;
        }

        .screenshot-btn {
            display: inline-block;
            background-color: #17a2b8;
            color: white;
            padding: 6px 12px;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            font-size: 0.85em;
            border: none;
            transition: background-color 0.3s ease;
        }

        .screenshot-btn:hover {
            background-color: #138496;
        }

        .details-btn {
            display: inline-block;
            background-color: #6c757d;
            color: white;
            padding: 6px 12px;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            font-size: 0.85em;
            border: none;
            transition: background-color 0.3s ease;
        }

        .details-btn:hover {
            background-color: #5a6268;
        }

        .screenshot-btn.no-images {
            background-color: #ccc;
            cursor: not-allowed;
        }

        .screenshot-btn.no-images:hover {
            background-color: #ccc;
        }

        .validation-row {
            background-color: #f0f8ff;
            border-top: 2px solid #007bff;
        }

        .validation-details {
            padding: 20px !important;
        }

        .validations-container h4 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 1.05em;
        }

        .validation-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 10px;
        }

        .validation-list li {
            padding: 10px 15px;
            border-radius: 5px;
            background: white;
            border-left: 4px solid;
            font-size: 0.9em;
            line-height: 1.4;
        }

        .validation-pass {
            border-left-color: #28a745;
            color: #155724;
            background-color: #d4edda;
        }

        .validation-fail {
            border-left-color: #dc3545;
            color: #721c24;
            background-color: #f8d7da;
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
        }

        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 30px;
            border-radius: 10px;
            max-width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #ddd;
        }

        .modal-header h2 {
            margin: 0;
            color: #333;
        }

        .close-btn {
            font-size: 2em;
            font-weight: bold;
            color: #aaa;
            cursor: pointer;
            background: none;
            border: none;
            padding: 0;
            line-height: 1;
        }

        .close-btn:hover {
            color: #000;
        }

        .screenshots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .screenshot-item {
            text-align: center;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
            border: 1px solid #ddd;
        }

        .screenshot-item h4 {
            margin-bottom: 10px;
            color: #333;
            font-size: 0.95em;
            word-break: break-word;
        }

        .screenshot-item img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            border: 2px solid #ddd;
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        .screenshot-item img:hover {
            transform: scale(1.05);
        }

        .screenshot-fullscreen {
            display: none;
            position: fixed;
            z-index: 1001;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.95);
        }

        .screenshot-fullscreen.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .screenshot-fullscreen img {
            max-width: 90%;
            max-height: 90%;
        }

        .screenshot-fullscreen .close-btn {
            position: absolute;
            top: 20px;
            right: 30px;
            color: white;
            font-size: 3em;
        }

        @media (max-width: 768px) {
            .charts-container {
                flex-direction: column;
                gap: 30px;
            }

            .chart-box {
                flex: 1;
            }

            .stat-item {
                display: block;
                margin: 15px 0;
            }

            h1 {
                font-size: 1.8em;
            }

            th, td {
                padding: 10px;
                font-size: 0.85em;
            }

            .test-id {
                font-size: 0.75em;
            }

            .screenshots-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎭 Playwright Test Report</h1>
        
        <div class="summary-stats" id="summaryStats">
            <div class="stat-item">
                <div class="stat-label">Total Tests</div>
                <div class="stat-value">${totalTests}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Passed</div>
                <div class="stat-value stat-passed">${passedCount}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Failed</div>
                <div class="stat-value stat-failed">${failedCount}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Skipped</div>
                <div class="stat-value stat-skipped">${skippedCount}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Success Rate</div>
                <div class="stat-value stat-passed">${successRate}%</div>
            </div>
        </div>

        <div class="charts-container">
            <div class="chart-box">
                <h3>Test Results Distribution</h3>
                <canvas id="resultsPieChart"></canvas>
            </div>
        </div>

        <div class="table-wrapper">
            <div class="table-title">Test Cases Details</div>
            <table>
                <thead>
                    <tr>
                        <th style="min-width: 200px;">Test ID</th>
                        <th style="min-width: 250px;">Test Title</th>
                        <th style="text-align: center; width: 100px;">Status</th>
                        <th style="text-align: center; width: 100px;">Duration (s)</th>
                        ${stepHeadersHTML}
                        <th style="text-align: center; width: 120px;">Screenshots</th>
                        <th style="text-align: center; width: 100px;">Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRowsHTML}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Screenshot Modal -->
    <div id="screenshotModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Screenshots</h2>
                <button class="close-btn" onclick="closeScreenshotModal()">&times;</button>
            </div>
            <div class="screenshots-grid" id="screenshotsGrid"></div>
        </div>
    </div>

    <!-- Fullscreen Screenshot Viewer -->
    <div id="fullscreenViewer" class="screenshot-fullscreen">
        <button class="close-btn" onclick="closeFullscreen()">&times;</button>
        <img id="fullscreenImage" src="" alt="Fullscreen">
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
    <script>
        const allTestsData = ${testsDataJSON};

        // Create pie chart
        const ctx = document.getElementById('resultsPieChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed', 'Skipped'],
                datasets: [{
                    data: [${passedCount}, ${failedCount}, ${skippedCount}],
                    backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
                    borderColor: ['#1e7e34', '#bd2130', '#e0a800'],
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Test Execution Summary',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: { font: { size: 12 }, padding: 15 }
                    }
                }
            }
        });

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function toggleValidations(testIndex) {
            const validationRow = document.getElementById(\`validations-\${testIndex}\`);
            if (validationRow) {
                validationRow.style.display = validationRow.style.display === 'none' ? 'table-row' : 'none';
            }
        }

        function showScreenshots(testIndex, testTitle) {
            const test = allTestsData[testIndex];
            if (!test || Object.keys(test.screenshots).length === 0) {
                alert('No screenshots available for this test.');
                return;
            }

            const modal = document.getElementById('screenshotModal');
            const grid = document.getElementById('screenshotsGrid');
            const titleElement = document.getElementById('modalTitle');

            titleElement.textContent = \`Screenshots: \${testTitle}\`;
            grid.innerHTML = '';

            Object.keys(test.screenshots).forEach(name => {
                const screenshotHTML = \`
                    <div class="screenshot-item">
                        <h4>\${escapeHtml(name)}</h4>
                        <img src="\${test.screenshots[name]}" 
                             alt="\${escapeHtml(name)}" 
                             onclick="openFullscreen(this.src)"
                             title="Click to view fullscreen">
                    </div>
                \`;
                grid.insertAdjacentHTML('beforeend', screenshotHTML);
            });

            modal.style.display = 'block';
        }

        function closeScreenshotModal() {
            document.getElementById('screenshotModal').style.display = 'none';
        }

        function openFullscreen(imageSrc) {
            const viewer = document.getElementById('fullscreenViewer');
            const img = document.getElementById('fullscreenImage');
            img.src = imageSrc;
            viewer.classList.add('active');
        }

        function closeFullscreen() {
            const viewer = document.getElementById('fullscreenViewer');
            viewer.classList.remove('active');
        }

        window.onclick = function(event) {
            const modal = document.getElementById('screenshotModal');
            if (event.target === modal) {
                closeScreenshotModal();
            }
        };
    </script>
</body>
</html>`;
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = CustomReporter;
