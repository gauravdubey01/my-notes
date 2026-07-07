using System;
using System.IO;
using System.Drawing;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

namespace MyNotes
{
    public class MainForm : Form
    {
        private WebView2 webView;
        private NotesBridge bridge;

        public MainForm()
        {
            Text = "My Notes v1.0.0";
            Size = new Size(1200, 800);
            MinimumSize = new Size(900, 600);
            StartPosition = FormStartPosition.CenterScreen;
            Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            BackColor = Color.FromArgb(247, 244, 239);

            bridge = new NotesBridge();
            bridge.OnRequestClose += () => { try { Invoke((MethodInvoker)Close); } catch { } };
            bridge.OnRequestMinimize += () =>
            {
                try { Invoke((MethodInvoker)(() => WindowState = FormWindowState.Minimized)); } catch { }
            };

            webView = new WebView2();
            webView.Dock = DockStyle.Fill;
            webView.CreationProperties = null;
            Controls.Add(webView);

            Load += MainForm_Load;
            FormClosing += (s, e) => bridge.Save();
        }

        private async void MainForm_Load(object sender, EventArgs e)
        {
            try
            {
                var env = await CoreWebView2Environment.CreateAsync(null, null, null);
                await webView.EnsureCoreWebView2Async(env);

                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                webView.CoreWebView2.AddHostObjectToScript("bridge", bridge);

                string distPath = Path.Combine(Application.StartupPath, "dist");
                string htmlPath = Path.Combine(distPath, "index.html");
                if (File.Exists(htmlPath))
                {
                    webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                        "app.local", distPath, CoreWebView2HostResourceAccessKind.Allow);
                    webView.CoreWebView2.Navigate("https://app.local/index.html");
                }
                else
                {
                    webView.CoreWebView2.Navigate("about:blank");
                }

            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "WebView2 runtime not found. Please install Microsoft Edge WebView2.\n\n" + ex.Message,
                    "My Notes", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Close();
            }
        }

        protected override void WndProc(ref Message m)
        {
            const int WM_SYSCOMMAND = 0x0112;
            const int SC_MINIMIZE = 0xF020;

            if (m.Msg == WM_SYSCOMMAND && (int)m.WParam == SC_MINIMIZE && bridge != null && bridge.AlwaysOnTop)
            {
                WindowState = FormWindowState.Minimized;
                return;
            }
            base.WndProc(ref m);
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            try { Application.Run(new MainForm()); }
            catch (Exception ex)
            {
                MessageBox.Show("Fatal error: " + ex.Message, "My Notes",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
