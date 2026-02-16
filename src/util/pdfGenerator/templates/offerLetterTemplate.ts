export const offerLetterTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="header">Offer Letter</div>

  <div class="content">
    <p>Date: {{date}}</p>

    <p>Dear {{candidate.name}},</p>

    <p>
      We are pleased to offer you the position of
      <strong>{{job.title}}</strong> at {{company.name}}.
    </p>

    <p>
      Your annual CTC will be {{salary.ctc}}.
    </p>

    <p>
      Your joining date will be {{joiningDate}}.
    </p>

    <p>
      Sincerely,<br />
      {{company.hrName}}<br />
      {{company.name}}
    </p>
  </div>
</body>
</html>
`;

export default offerLetterTemplate;