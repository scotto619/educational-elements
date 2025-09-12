// pages/api/export-emails.js - Clean email export with CSV option
import { adminFirestore } from '../../utils/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all users from Firestore
    const usersSnapshot = await adminFirestore.collection('users').get();
    
    const users = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.email) {
        users.push({
          email: userData.email,
          signupDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown',
          subscription: userData.subscription || 'none',
          status: userData.subscription === 'educational-elements' ? 'Active' : 
                  userData.subscription === 'cancelled' ? 'Cancelled' : 
                  userData.freeAccessUntil && new Date(userData.freeAccessUntil) > new Date() ? 'Free Trial' : 'None'
        });
      }
    });

    // Sort by signup date (newest first)
    users.sort((a, b) => new Date(b.signupDate) - new Date(a.signupDate));

    // Check if CSV format is requested
    if (req.query.format === 'csv') {
      const csvHeaders = 'Email,Signup Date,Subscription,Status\n';
      const csvData = users.map(user => 
        `"${user.email}","${user.signupDate}","${user.subscription}","${user.status}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="educational-elements-users.csv"');
      return res.status(200).send(csvHeaders + csvData);
    }

    // Return clean HTML table format
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Educational Elements Users</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .stats { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .active { color: #059669; font-weight: bold; }
            .cancelled { color: #dc2626; }
            .trial { color: #d97706; }
            .export-links { margin-bottom: 20px; }
            .export-links a { 
                display: inline-block; 
                background: #3b82f6; 
                color: white; 
                padding: 10px 20px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin-right: 10px; 
            }
        </style>
    </head>
    <body>
        <h1>Educational Elements User Export</h1>
        
        <div class="stats">
            <h3>Summary</h3>
            <p><strong>Total Users:</strong> ${users.length}</p>
            <p><strong>Active Subscribers:</strong> ${users.filter(u => u.status === 'Active').length}</p>
            <p><strong>Free Trials:</strong> ${users.filter(u => u.status === 'Free Trial').length}</p>
            <p><strong>Cancelled:</strong> ${users.filter(u => u.status === 'Cancelled').length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="export-links">
            <a href="?format=csv">Download CSV</a>
            <a href="#" onclick="copyEmails()">Copy All Emails</a>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Signup Date</th>
                    <th>Subscription</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.email}</td>
                        <td>${user.signupDate}</td>
                        <td>${user.subscription}</td>
                        <td class="${user.status.toLowerCase().replace(' ', '')}">${user.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 30px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
            <h3>Email List (for copy/paste):</h3>
            <textarea id="emailList" style="width: 100%; height: 200px; font-family: monospace;" readonly>
${users.map(u => u.email).join('\n')}
            </textarea>
        </div>

        <script>
            function copyEmails() {
                const textarea = document.getElementById('emailList');
                textarea.select();
                document.execCommand('copy');
                alert('All email addresses copied to clipboard!');
            }
        </script>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Error exporting emails:', error);
    res.status(500).json({ 
      error: 'Failed to export emails',
      details: error.message
    });
  }
}