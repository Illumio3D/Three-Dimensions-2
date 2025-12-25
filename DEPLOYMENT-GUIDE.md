# Guide: Getting Changes to Your Local Computer

## Pulling Changes from GitHub to Your Local Machine

To get all the changes from this pull request to your local computer, follow these steps:

### Option 1: Pull the PR Branch (Recommended)

```bash
# Navigate to your local repository folder
cd /path/to/Three-Dimensions-2

# Make sure you have the latest remote information
git fetch origin

# Switch to the PR branch
git checkout copilot/fix-transparent-videos-safari

# Pull the latest changes
git pull origin copilot/fix-transparent-videos-safari
```

### Option 2: After PR is Merged to Main

Once this pull request is merged to the main branch:

```bash
# Navigate to your local repository folder
cd /path/to/Three-Dimensions-2

# Switch to main branch
git checkout main

# Pull the latest changes
git pull origin main
```

### Verify You Have All Files

After pulling, verify you have these new files:

```bash
# Check for documentation
ls -l *.md

# Check for HEVC videos
ls -l *hevc.mp4

# Check for modified HTML files
git status
```

You should see:
- ✅ `BACKEND-REQUIREMENTS.md`
- ✅ `SAFARI-VIDEO-GUIDE.md`
- ✅ `IMPLEMENTATION-SUMMARY.md`
- ✅ `Rot-transparent.hevc.mp4`
- ✅ `Hellrot-transparent.hevc.mp4`
- ✅ `Pinktransparent.hevc.mp4`
- ✅ `Iphone-fbegining00086400.hevc.mp4`
- ✅ Updated HTML files with form validation and video fallbacks

---

## Sending Files to Your Programmer

### What to Send

Send your programmer:

1. **The entire repository folder** - They need all files including:
   - All HTML files
   - All video files (both .webm and .hevc.mp4)
   - All image files
   - All documentation files (.md)
   - CSS/JavaScript (if separate files)

2. **Important Documentation**:
   - `BACKEND-REQUIREMENTS.md` - Complete API specification
   - `IMPLEMENTATION-SUMMARY.md` - Overview of changes

### How to Send

**Option A: Via Git (Recommended)**
```bash
# If your programmer has GitHub access
# They can clone the repository:
git clone https://github.com/Illumio3D/Three-Dimensions-2.git
cd Three-Dimensions-2
git checkout copilot/fix-transparent-videos-safari
```

**Option B: Zip File**
```bash
# Create a zip of your repository (excludes .git folder)
zip -r three-dimensions-website.zip . -x "*.git*" -x "*.DS_Store"
```

Then send the `three-dimensions-website.zip` file via email, file transfer, or cloud storage.

---

## Using the Form API on Your Own Server

### YES - Your Programmer Can Use the API on Your Own Server

The form is designed to POST to `/api/contact` which means:

✅ **Your programmer can implement this endpoint on your own server**

### Backend Implementation Steps

1. **Choose Your Backend Technology**:
   - Node.js + Express
   - PHP
   - Python (Flask/Django)
   - Java (Spring Boot)
   - .NET Core
   - Any web framework you prefer

2. **Create the API Endpoint**: `/api/contact`
   - Method: POST
   - Content-Type: application/json
   - Complete specification in `BACKEND-REQUIREMENTS.md`

3. **Example Implementations**:

#### Node.js + Express Example

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

// CORS for your domain
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-domain.de');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/api/contact', async (req, res) => {
  const { company, email, interests, message, consent } = req.body;
  
  // Validate required fields
  if (!company || !email || !interests || !message || !consent) {
    return res.status(400).json({
      success: false,
      message: 'Alle Pflichtfelder müssen ausgefüllt werden.'
    });
  }
  
  // Configure email
  const transporter = nodemailer.createTransport({
    host: 'your-smtp-server.com',
    port: 587,
    auth: {
      user: 'your-email@domain.de',
      pass: 'your-password'
    }
  });
  
  // Send email
  await transporter.sendMail({
    from: 'website@your-domain.de',
    to: 'kontakt@three-dimensions.de',
    subject: 'Neue Projektanfrage von Website',
    text: `
      Neue Anfrage:
      
      Unternehmen: ${company}
      E-Mail: ${email}
      Interessen: ${interests.join(', ')}
      
      Nachricht:
      ${message}
    `
  });
  
  res.json({
    success: true,
    message: 'Anfrage erfolgreich gesendet.'
  });
});

app.listen(3000, () => {
  console.log('API running on port 3000');
});
```

#### PHP Example

```php
<?php
// api/contact.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://your-domain.de');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate
    if (empty($data['company']) || empty($data['email']) || 
        empty($data['message']) || empty($data['consent'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Alle Pflichtfelder müssen ausgefüllt werden.'
        ]);
        exit;
    }
    
    // Sanitize
    $company = htmlspecialchars($data['company']);
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars($data['message']);
    $interests = implode(', ', $data['interests']);
    
    // Send email
    $to = 'kontakt@three-dimensions.de';
    $subject = 'Neue Projektanfrage von Website';
    $body = "Neue Anfrage:\n\n";
    $body .= "Unternehmen: $company\n";
    $body .= "E-Mail: $email\n";
    $body .= "Interessen: $interests\n\n";
    $body .= "Nachricht:\n$message";
    
    $headers = "From: website@your-domain.de\r\n";
    $headers .= "Reply-To: $email\r\n";
    
    if (mail($to, $subject, $body, $headers)) {
        echo json_encode([
            'success' => true,
            'message' => 'Anfrage erfolgreich gesendet.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Fehler beim Senden.'
        ]);
    }
}
?>
```

### Server Configuration

Your programmer needs to:

1. **Configure Web Server** (Apache/Nginx) to route `/api/contact` to the backend
2. **Set up SSL/HTTPS** (required for production)
3. **Configure Email Sending**:
   - SMTP server credentials
   - Or use a service like SendGrid, Mailgun, AWS SES
4. **Test the API** before deploying to production

### URL Configuration

The form currently sends to `/api/contact` which means:
- If your site is at `https://three-dimensions.de`
- The API endpoint will be `https://three-dimensions.de/api/contact`

**No changes needed to the HTML** - the relative URL `/api/contact` will work automatically on your domain.

### Testing

After deployment, test the form:

1. Fill out the form with test data
2. Submit the form
3. Check that you receive the email at `kontakt@three-dimensions.de`
4. Verify error handling works (try submitting empty form)

---

## Important Notes

### For Your Programmer

1. **Read BACKEND-REQUIREMENTS.md** - Complete API specification
2. **Implement validation** - Don't trust client-side validation alone
3. **Sanitize inputs** - Prevent SQL injection/XSS attacks
4. **Rate limiting** - Prevent spam (max 5 submissions per hour per IP)
5. **GDPR compliance** - Handle data according to German privacy laws
6. **Logging** - Log submissions for troubleshooting

### Security Checklist

- [ ] HTTPS enabled
- [ ] Input validation on backend
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize outputs)
- [ ] Rate limiting implemented
- [ ] CORS configured for your domain only
- [ ] Email credentials secured (use environment variables)
- [ ] Error messages don't expose sensitive info

### Deployment Checklist

- [ ] Backend API tested locally
- [ ] Email sending works
- [ ] HTTPS certificate installed
- [ ] DNS configured correctly
- [ ] All files uploaded to server
- [ ] Form tested on production domain
- [ ] Tested on multiple browsers (Chrome, Firefox, Safari)
- [ ] Tested on mobile devices

---

## Questions?

If your programmer has questions about the API specification, they should refer to:
- **BACKEND-REQUIREMENTS.md** - Complete technical specification
- **IMPLEMENTATION-SUMMARY.md** - Overview and context

The current implementation provides everything needed on the frontend. Your programmer just needs to implement the backend endpoint following the specification.

## Contact

For questions about the implementation:
- Email: kontakt@three-dimensions.de
- Refer to the documentation files in the repository
