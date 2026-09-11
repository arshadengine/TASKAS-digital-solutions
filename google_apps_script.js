// Google Apps Script code to handle both INITIATE'S and ESTIMATOR INQUIRY sheets dynamically.
// Replace the code in your Apps Script Editor (Extensions > Apps Script) with this script.
// Click Save and Deploy (New Deployment > Web App > Executed as: Me, Who has access: Anyone).

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // 1. Recruitment Email Dispatcher Action
    if (data.action === "send_applicant_email" || data.action === "send_email") {
      var to = data.to;
      var subject = data.subject || "Application Update — TASKAS";
      var htmlBody = data.htmlBody;
      
      if (!to || !htmlBody) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Missing 'to' or 'htmlBody' in email request."
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      MailApp.sendEmail({
        to: to,
        subject: subject,
        htmlBody: htmlBody,
        name: "TASKAS People & Culture"
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Recruitment email sent successfully to " + to,
        stage: data.stage || "Notification"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Candidate Application Logger Action
    if (data.action === "save_application") {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var appSheet = ss.getSheetByName("APPLICATIONS");
      if (!appSheet) {
        appSheet = ss.insertSheet("APPLICATIONS");
        appSheet.appendRow([
          "Application ID", "Name", "Email", "Phone", "City", "Position", 
          "Experience", "Type", "Status", "Date", "Portfolio Link", "Resume Link", 
          "Portfolio PDF", "Resume PDF", "Why TASKAS", "Cover Note"
        ]);
      }
      
      var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
      appSheet.appendRow([
        data.applicationId || ("APP-" + new Date().getTime()),
        data.name || "",
        data.email || "",
        data.phone || "",
        data.city || "",
        data.position || "",
        data.experience || "Fresher",
        data.isInternship ? "Internship" : "Full-Time",
        data.status || "New",
        nowStr,
        data.portfolio || "",
        data.resume || "",
        (data.portfolioPdf && data.portfolioPdf.name) || "",
        (data.resumePdf && data.resumePdf.name) || "",
        data.whyTaskas || "",
        data.cover || ""
      ]);

      // Notify HR / Leadership team
      try {
        var emailSub = "🚀 New Candidate Application: " + (data.name || "Applicant") + " — " + (data.position || "General");
        var emailBody = "A new job/internship application has been submitted on TASKAS!\n\n" +
                        "Candidate Name: " + (data.name || "-") + "\n" +
                        "Email: " + (data.email || "-") + "\n" +
                        "Phone: " + (data.phone || "-") + "\n" +
                        "City: " + (data.city || "-") + "\n" +
                        "Role: " + (data.position || "-") + "\n" +
                        "Experience: " + (data.experience || "Fresher") + "\n" +
                        "Type: " + (data.isInternship ? "Internship" : "Full-Time") + "\n" +
                        "Portfolio: " + (data.portfolio || (data.portfolioPdf ? data.portfolioPdf.name : "None")) + "\n" +
                        "Resume: " + (data.resume || (data.resumePdf ? data.resumePdf.name : "None")) + "\n\n" +
                        "Access the Admin Dashboard to review & update status:\n" +
                        "https://taskas.tech/admin";
        MailApp.sendEmail("team@taskas.tech", emailSub, emailBody);
      } catch (alertErr) {
        Logger.log("Admin email alert failed: " + alertErr);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Candidate application recorded in APPLICATIONS tab and team alerted.",
        applicationId: data.applicationId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheetName = data.sheetName || "INITIATE'S";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Find sheet by name (case-insensitive and trimmed)
    var sheet = null;
    var sheets = ss.getSheets();
    var targetName = sheetName.toUpperCase().trim();
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName().toUpperCase().trim() === targetName) {
        sheet = sheets[i];
        break;
      }
    }
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Sheet tab '" + sheetName + "' not found in spreadsheet."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get headers to dynamically map columns
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = [];
    var timestamp = new Date();
    
    // Format timestamp as DD/MM/YYYY HH:MM:SS
    var formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i].toString().toUpperCase().trim();
      
      // Auto-populate serial numbers and date
      if (header === "SR. NO." || header === "# SR. NO." || header === "#") {
        newRow.push(sheet.getLastRow()); // Next Serial Number
      } else if (header === "DATE") {
        newRow.push(formattedDate);
      } else {
        // Find value matching header or its aliases
        newRow.push(getAliasValue(data, header));
      }
    }
    
    sheet.appendRow(newRow);
    
    // Send email notification to admin
    try {
      var subject = "New Lead on " + sheetName + " - " + (data.service || data.devType || "General");
      var body = "A new inquiry has been recorded in the '" + sheetName + "' tab.\n\n" +
                 "Name/Type: " + (data.name || data.devType || "") + "\n" +
                 "Email: " + (data.email || "") + "\n" +
                 "WhatsApp/Phone: " + (data.phone || data.wpNumber || "") + "\n" +
                 "Estimate Range: " + (data.estRange || (data.minPrice ? ("Rs. " + data.minPrice + " - Rs. " + data.maxPrice) : "") || "") + "\n\n" +
                 "Details:\n" + (data.message || data.description || "");
                 
      MailApp.sendEmail("team@taskas.tech", subject, body);
    } catch (mailErr) {
      Logger.log("Mail notification failed: " + mailErr.toString());
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Row appended to " + sheetName
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getAliasValue(data, header) {
  // 1. Direct case-insensitive match
  for (var key in data) {
    if (key.toUpperCase().trim() === header) {
      return data[key];
    }
  }
  
  // 2. Normalised alias matching
  var norm = header.replace(/[^A-Z]/g, ""); // strip spaces/symbols
  
  if (norm === "FULLNAME" || norm === "NAME") {
    return data.name || data.fullName || "";
  }
  if (norm === "EMAILADDRESS" || norm === "EMAIL" || norm === "EMAILID") {
    return data.email || data.emailId || data.email_id || "";
  }
  if (norm === "SERVICENEEDED" || norm === "SERVICE" || norm === "INQUIRYFOR") {
    return data.service || data.inquiryFor || "";
  }
  if (norm === "PROJECTDETAILS" || norm === "MESSAGE" || norm === "INQUIRYDESCRIPTION") {
    return data.message || data.inquiryDescription || data.description || "";
  }
  if (norm === "WPNUMBER" || norm === "PHONE" || norm === "MOBILE" || norm === "WPNUM") {
    return data.phone || data.wpNumber || "";
  }
  if (norm === "CONTACTSTATUS" || norm === "CONNECTSTATUS" || norm === "STATUS") {
    return data.connectStatus || data.contactStatus || "Pending";
  }
  
  return "";
}
