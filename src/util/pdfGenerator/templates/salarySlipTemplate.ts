export const SALARY_SLIP_BACKGROUND_IMAGE = `data:image/png;base64,{{backgroundImageBase64}}`;

export const salarySlipTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salary Slip - {{payPeriod}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
        }

        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 12px;
            color: #333;
            background-color: #fff;
            padding: 20px;
            padding-top: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100%;
            position: relative;
        }

        /* Background watermark */
        body::before {
            content: '';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 150px;
            background-image: url('{{backgroundImage}}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            opacity: 0.08;
            z-index: -1;
            pointer-events: none;
        }

        .salary-slip-container {
            max-width: 800px;
            width: 100%;
            margin: 70px auto 0 auto; 
            border: 2px solid #5dade2;
            overflow: hidden;
            background-color: rgba(255, 255, 255, 0.95);
        }

        .slip-title {
            background-color: #f8f9fa;
            padding: 10px;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #0c0c0c;
            border-bottom: 1px solid #ddd;
        }

        .pay-period-header {
            background-color: #e8f4f8;
            padding: 8px;
            text-align: center;
            font-size: 13px;
            font-weight: 600;
            color: #2c3e50;
        }

        /* Employee Details Section */
        .employee-details {
            padding: 15px 20px;
            background-color: #fff;
        }

        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .detail-row {
            display: flex;
            padding: 5px 0;
            border-bottom: 1px dotted #eee;
        }

        .detail-label {
            font-weight: 600;
            color: #555;
            min-width: 140px;
        }

        .detail-value {
            color: #333;
        }

        .highlight-row {
            background-color: #e8f4f8;
            padding: 10px;
            margin-bottom: 10px;
        }

        .highlight-row .detail-row {
            border-bottom: none;
            padding: 3px 0;
        }

        .highlight-row .detail-label {
            color: #2c3e50;
            font-weight: 700;
        }

        .highlight-row .detail-value {
            color: #1a5276;
            font-weight: 600;
        }

        /* Salary Breakdown Section */
        .salary-breakdown {
            padding: 15px 20px;
        }

        .breakdown-header {
            background-color: #aed6f1;
            color: #2c3e50;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 13px;
            display: grid;
            grid-template-columns: 1fr 1fr;
        }

        .breakdown-header span:last-child {
            text-align: right;
        }

        .breakdown-table {
            width: 100%;
            border-collapse: collapse;
        }

        .breakdown-table th,
        .breakdown-table td {
            padding: 10px 15px;
            text-align: left;
            border: 1px solid #ddd;
        }

        .breakdown-table th {
            background-color: #aed6f1;
            color: #2c3e50;
            font-weight: 600;
        }

        .amount-column {
            text-align: right !important;
            font-family: 'Helvetica Neue', Arial, sans-serif;
        }

        .earnings-section {
            background-color: #e8f5e9;
        }

        .deductions-section {
            background-color: #ffebee;
        }

        .total-row {
            font-weight: bold;
            background-color: #f5f5f5;
        }

        .total-row.earnings {
            background-color: #c8e6c9;
        }

        .total-row.deductions {
            background-color: #ffcdd2;
        }

        /* Net Pay Section */
        .net-pay-section {
            background: linear-gradient(135deg, #1e8449 0%, #27ae60 100%);
            color: #fff;
            padding: 15px 25px;
            margin: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .net-pay-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .net-pay-label {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .net-pay-amount {
            font-size: 26px;
            font-weight: bold;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: rgba(255, 255, 255, 0.2);
            padding: 5px 15px;
        }

        .net-pay-words {
            font-size: 12px;
            font-style: italic;
            opacity: 0.9;
            text-align: right;
            max-width: 350px;
        }

        /* Attendance Section */
        .attendance-section {
            padding: 10px 20px;
            background-color: #f8f9fa;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            border-top: 1px solid #ddd;
        }

        .attendance-item {
            text-align: center;
            padding: 10px;
            background-color: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .attendance-value {
            font-size: 20px;
            font-weight: bold;
            color: #5dade2;
        }

        .attendance-label {
            font-size: 11px;
            color: #666;
            margin-top: 3px;
        }

        /* Footer Section */
        .footer {
            padding: 15px 20px;
            background-color: #f8f9fa;
            border-top: 1px solid #ddd;
            text-align: left;
            font-size: 10px;
            color: #666;
        }

        .disclaimer {
            margin-top: 10px;
            font-style: italic;
        }

        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 20px;
            margin-top: 10px;
        }

        .signature-box {
            text-align: center;
            padding-top: 40px;
            border-top: 1px solid #333;
        }

        /* Two Column Layout for Earnings and Deductions */
        .two-column-breakdown {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 15px 20px;
        }

        .column-section {
            border: 1px solid #ddd;
            overflow: hidden;
        }

        .column-header {
            padding: 10px 15px;
            font-weight: bold;
            text-align: center;
        }

        .column-header.earnings {
            background-color: #abebc6;
            color: #0c0c0c;
        }

        .column-header.deductions {
            background-color: #f5b7b1;
            color: #0c0c0c;
        }

        .column-content {
            padding: 10px;
        }

        .column-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 10px;
            border-bottom: 1px dotted #eee;
        }

        .column-row:last-child {
            border-bottom: none;
        }

        .column-total {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            font-weight: bold;
            border-top: 2px solid #ddd;
        }

        .column-total.earnings {
            background-color: #d5f5e3;
        }

        .column-total.deductions {
            background-color: #fadbd8;
        }
    </style>
</head>
<body>
    <div class="salary-slip-container">
        <!-- Slip Title -->
        <div class="slip-title">SALARY SLIP</div>
        <div class="pay-period-header">Payslip for the month of {{payslipMonth}}</div>

        <!-- Employee Details -->
        <div class="employee-details">
            <!-- First Row: Emp ID and Employee Name side by side (highlighted) -->
            <div class="details-grid highlight-row">
                <div class="detail-row">
                    <span class="detail-label">Employee ID:</span>
                    <span class="detail-value">{{employeeId}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Employee Name:</span>
                    <span class="detail-value">{{employeeName}}</span>
                </div>
            </div>
            <!-- Other Details -->
            <div class="details-grid">
                <div>
                    <div class="detail-row">
                        <span class="detail-label">Designation:</span>
                        <span class="detail-value">{{designation}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Department:</span>
                        <span class="detail-value">{{department}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date of Joining:</span>
                        <span class="detail-value">{{dateOfJoining}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Pay Period:</span>
                        <span class="detail-value">{{payPeriodRange}}</span>
                    </div>
                </div>
                <div>
                    <div class="detail-row">
                        <span class="detail-label">Bank Name:</span>
                        <span class="detail-value">{{bankName}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">IFSC Code:</span>
                        <span class="detail-value">{{IFSCCODE}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Account Number:</span>
                        <span class="detail-value">{{bankAccountNumber}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transaction Type:</span>
                        <span class="detail-value">{{transactionType}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transaction ID:</span>
                        <span class="detail-value">{{transactionId}}</span>
                    </div>
                </div>
            </div>
            <!-- PAN and UAN on same row -->
            <div class="details-grid" style="margin-top: 10px;">
                <div class="detail-row">
                    <span class="detail-label">PAN Number:</span>
                    <span class="detail-value">{{panNumber}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">UAN Number:</span>
                    <span class="detail-value">{{uanNumber}}</span>
                </div>
            </div>
        </div>

        <!-- Attendance Summary -->
        <div class="attendance-section">
            <div class="attendance-item">
                <div class="attendance-value">{{totalWorkingDays}}</div>
                <div class="attendance-label">Total Working Days</div>
            </div>
            <div class="attendance-item">
                <div class="attendance-value">{{daysWorked}}</div>
                <div class="attendance-label">Days Worked</div>
            </div>
            <div class="attendance-item">
                <div class="attendance-value">{{lossOfPayDays}}</div>
                <div class="attendance-label">Loss of Pay Days</div>
            </div>
        </div>

        <!-- Salary Breakdown - Two Column Layout -->
        <div class="two-column-breakdown">
            <!-- Earnings Column -->
            <div class="column-section">
                <div class="column-header earnings">EARNINGS</div>
                <div class="column-content">
                    <div class="column-row">
                        <span>Basic Salary</span>
                        <span class="amount-column">₹ {{calculations.basicSalary}}</span>
                    </div>
                    <div class="column-row">
                        <span>House Rent Allowance (HRA)</span>
                        <span class="amount-column">₹ {{calculations.hra}}</span>
                    </div>
                    <div class="column-row">
                        <span>Special Allowance</span>
                        <span class="amount-column">₹ {{calculations.specialAllowance}}</span>
                    </div>
                    <div class="column-row">
                        <span>Conveyance Allowance</span>
                        <span class="amount-column">₹ {{calculations.conveyanceAllowance}}</span>
                    </div>
                    <div class="column-row">
                        <span>Medical Allowance</span>
                        <span class="amount-column">₹ {{calculations.medicalAllowance}}</span>
                    </div>
                    <div class="column-row">
                        <span>Other Allowances</span>
                        <span class="amount-column">₹ {{calculations.otherAllowances}}</span>
                    </div>
                </div>
                <div class="column-total earnings">
                    <span>Gross Earnings</span>
                    <span>₹ {{calculations.grossEarnings}}</span>
                </div>
            </div>

            <!-- Deductions Column -->
            <div class="column-section">
                <div class="column-header deductions">DEDUCTIONS</div>
                <div class="column-content">
                    <div class="column-row">
                        <span>Provident Fund (PF)</span>
                        <span class="amount-column">₹ {{calculations.providentFund}}</span>
                    </div>
                    <div class="column-row">
                        <span>Professional Tax</span>
                        <span class="amount-column">₹ {{calculations.professionalTax}}</span>
                    </div>
                    <div class="column-row">
                        <span>Income Tax (TDS)</span>
                        <span class="amount-column">₹ {{calculations.incomeTax}}</span>
                    </div>
                    <div class="column-row">
                        <span>Other Deductions</span>
                        <span class="amount-column">₹ {{calculations.otherDeductions}}</span>
                    </div>
                </div>
                <div class="column-total deductions">
                    <span>Total Deductions</span>
                    <span>₹ {{calculations.totalDeductions}}</span>
                </div>
            </div>
        </div>

        <!-- Net Pay Section -->
        <div class="net-pay-section">
            <div class="net-pay-left">
                <div class="net-pay-label">Net Pay:</div>
                <div class="net-pay-amount">₹ {{calculations.netPay}}</div>
            </div>
            <div class="net-pay-words">{{calculations.netPayInWords}}</div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="disclaimer">
                This is a computer-generated document and does not require a signature.
            </div>
            <div style="margin-top: 5px;">
                For any queries, please contact admin@srytal.com
            </div>
        </div>
    </div>
</body>
</html>
`;

export default salarySlipTemplate;
