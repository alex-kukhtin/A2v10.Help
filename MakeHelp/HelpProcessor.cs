using Newtonsoft.Json;

using System;
using System.IO;
using System.Xml;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using MakeHelp.Properties;
using System.Text;
using System.Diagnostics;

namespace MakeHelp
{
    public class FileInfo
    {
        public String url;
        public String title;
    }

    public class FileDictionary : Dictionary<String, List<Int32>>
    {
        public void Add(String key, Int32 value)
        {
            List<Int32> files;
            if (this.TryGetValue(key, out files))
            {
                if (!files.Contains(value))
                    files.Add(value);
            }
            else
            {
                files = new List<Int32>();
                files.Add(value);
                this.Add(key, files);
            }
        }
    }

    public class HelpProcessor
    {
        const String HTML = "*.html";

        List<FileInfo> _files = new List<FileInfo>();

        FileDictionary _keywords = new FileDictionary();
        FileDictionary _fts = new FileDictionary();

        ContentItem _content = new ContentItem();

        public Boolean HasErrors { get; set; }

        HashSet<String> _stopWords;

        Boolean IsStopWord(String word)
        {
            if (_stopWords == null)
            {
                _stopWords = new HashSet<String>();
                foreach (var x in Resources.stopwords.Split('\n'))
                    _stopWords.Add(x.Trim());
            }
            return _stopWords.Contains(word);
        }

        void ProcessKeywords(String keywords, Int32 fileIndex)
        {
            var kw = keywords.Split(';');
            foreach (var w in kw)
            {
                String key = w.Trim();
                if (String.IsNullOrEmpty(key))
                    continue;
                _keywords.Add(key, fileIndex);
            }
        }

        void ProcessComment(XmlComment comment, Int32 fileIndex)
        {
            String val = comment.Value.ToString();
            if (val.IndexOf("keywords:") == 0)
            {
                var kw = val.Substring(9).Trim();
                ProcessKeywords(kw, fileIndex);
            }
            else if (val.IndexOf("title:") == 0)
            {
                var title = val.Substring(6);
                var fi = _files[fileIndex];
                fi.title = title;
            }
        }

        void ProcessText(String txt, Int32 fileIndex)
        {
            var words = Regex.Split(txt.ToLower(), @"[\s,\'\""\-\(\)\[\]\}\{\?;!@&]+");
            foreach (var ww in words)
            {
                var word = ww.Trim();
                if (word.EndsWith("."))
                {
                    word = word.Substring(0, word.Length - 1);
                }
                if (String.IsNullOrEmpty(word))
                    continue;
                if (IsStopWord(word))
                    continue;
                _fts.Add(word, fileIndex);
            }
        }

        void PopulateXml(XmlElement elem, Int32 fileIndex)
        {
            foreach (var xe in elem.ChildNodes)
            {
                if (xe is XmlComment)
                    ProcessComment((xe as XmlComment), fileIndex);
                else if (xe is XmlText)
                {
                    var xmlt = xe as XmlText;
                    String txt = xmlt.Value.ToString().Trim();
                    if (!String.IsNullOrEmpty(txt))
                        ProcessText(txt, fileIndex);
                }
                else if (xe is XmlElement)
                {
                    var xmle = xe as XmlElement;
                    if (xmle.Name.ToUpper() == "PRE")
                        continue; // skip code
                    PopulateXml(xmle, fileIndex);
                }
            }
        }

        void ProcessOneFile(String path, String fileUrl)
        {
            var fi = new FileInfo();
            fi.url = fileUrl;
            _files.Add(fi);

            Int32 ix = _files.Count - 1;

            try
            {
                XmlDocument doc = new XmlDocument();
                doc.Load(path);
                PopulateXml(doc.DocumentElement, ix);
                if (String.IsNullOrEmpty(fi.title))
                    throw new InvalidOperationException($"There is no title in {fi.url} file");
            }
            catch (XmlException ex)
            {
                HasErrors = true;
                Console.WriteLine($"ERROR: {ex.Message}");
            }
        }

        void ProcessFile(String file, String dir, Int32 level)
        {
            String fileName = Path.GetFileNameWithoutExtension(file);
            String fileUrl = $"{dir}/{fileName}";
            String tab = new String(' ', level * 2);
            Console.WriteLine($"{tab}file: {fileUrl}");
            ProcessOneFile(file, fileUrl);
        }

        void ProcessDirectory(String dir, String root, Int32 level)
        {
            foreach(var f in Directory.GetFiles(dir, HTML))
            {
                ProcessFile(f, root, level);
            }
            foreach (var d in Directory.GetDirectories(dir))
            {
                String pathName = Path.GetFileName(d);
                ProcessDirectory(d, $"{root}/{pathName}", level + 1);
            }
        }

        public void Process(String dir)
        {
            ProcessDirectory($"{dir}\\html", String.Empty, 0);
        }

        public void MakeContent(String fileName)
        {
            try
            {
                foreach (var ln in File.ReadAllLines(fileName))
                {
                    if (String.IsNullOrEmpty(ln))
                        continue;
                    _content.Add(ln);
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                Console.WriteLine($"ERROR: {ex.Message}");
            }
        }

        public String MakeJsFile()
        {
            var sb = new StringBuilder();
            sb.AppendLine(@"(function() { ");
            sb.AppendLine("/*GENERATED*/");
            sb.Append("const content = ")
                .AppendLine(JsonConvert.SerializeObject(_content,
                    new JsonSerializerSettings()
                    {
                        Formatting = Newtonsoft.Json.Formatting.Indented,
                        NullValueHandling = NullValueHandling.Ignore
                    }))
                .Append(";")
                .AppendLine();

            sb.Append("const files = ")
                .Append(JsonConvert.SerializeObject(_files))
                .Append(";")
                .AppendLine();

            sb.Append("const index = ")
                .Append(JsonConvert.SerializeObject(_keywords))
                .Append(";")
                .AppendLine();

            sb.Append("const fts = ")
                .Append(JsonConvert.SerializeObject(_fts))
                .Append(";")
                .AppendLine();

            sb.AppendLine("window.app = {content: content, files: files, index: index, fts: fts};");
            sb.Append("})();");
            return sb.ToString();
        }

        public void WriteBundle(String dirName)
        {
            var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            String bundlerPath = Path.Combine(appDataPath, @"Microsoft\VisualStudio\15.0_1705bee0\Extensions\lh1eakt1.nnl\BundlerMinifierConsole.exe");
            
            if (!File.Exists(bundlerPath))
                throw new FileNotFoundException("update bundler path");
            ProcessStartInfo psi = new ProcessStartInfo(bundlerPath, Path.Combine(dirName, "bundleconfig.json"));
            psi.UseShellExecute = false;
            psi.RedirectStandardOutput = false;
            System.Diagnostics.Process.Start(psi).WaitForExit();
        }
    }
}
