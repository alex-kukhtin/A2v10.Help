using Newtonsoft.Json;

using System;
using System.IO;
using System.Xml;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using MakeHelp.Properties;
using System.Text;
using System.Diagnostics;
using System.Configuration;

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
			if (this.TryGetValue(key, out List<Int32> files))
			{
				if (!files.Contains(value))
					files.Add(value);
			}
			else
			{
				files = new List<Int32>
				{
					value
				};
				this.Add(key, files);
			}
		}
	}

	public class SortedFileDictionary : SortedDictionary<String, List<Int32>>
	{
		public SortedFileDictionary()
			: base(StringComparer.OrdinalIgnoreCase)
		{
		}

		public void Add(String key, Int32 value)
		{
			if (this.TryGetValue(key, out List<Int32> files))
			{
				if (!files.Contains(value))
					files.Add(value);
			}
			else
			{
				files = new List<Int32>
				{
					value
				};
				this.Add(key, files);
			}
		}
	}


	public class HelpProcessor
	{
		const String HTML = "*.html";

		List<FileInfo> _files = new List<FileInfo>();

		SortedFileDictionary _keywords = new SortedFileDictionary();
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
			var fi = new FileInfo
			{
				url = fileUrl
			};
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
			foreach (var f in Directory.GetFiles(dir, HTML))
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
			StringBuilder sitemap = new StringBuilder();
			var host = ConfigurationManager.AppSettings["host"];
			if (host == null)
				throw new InvalidOperationException("appSettings/host not defined");
			try
			{
				foreach (var ln in File.ReadAllLines(fileName))
				{
					var lne = ln.TrimEnd();
					if (String.IsNullOrEmpty(lne))
						continue;
					var url =  _content.Add(lne);
					if (url != null)
						sitemap.AppendLine($"{host}{url}");
				}

				String sitemapFile = fileName.Replace("content.txt", "sitemap.txt");
				File.WriteAllText(sitemapFile, sitemap.ToString(), Encoding.UTF8);
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
						Formatting = Newtonsoft.Json.Formatting.None,
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

			sb.AppendLine("window.helpapp = {content: content, files: files, index: index, fts: fts};");
			sb.Append("})();");
			return sb.ToString();
		}

		public void WriteBundle(String dirName)
		{
			Console.WriteLine("Writing script...");
			String[] files = {
				"app/content.js",
				"app/include.js",
				"app/contentview.js",
				"app/indexview.js",
				"app/searchview.js",
				"app/app.js"
			};

			StringBuilder sb = new StringBuilder();
			var re = new Regex("[\\t\\r\\n]", RegexOptions.Compiled | RegexOptions.Multiline);
			foreach (var f in files)
			{
				var fp = Path.Combine(dirName, f);
				var txt = File.ReadAllText(fp);
				sb.Append(re.Replace(txt, ""));
				//sb.Append(txt);
				Console.WriteLine($"\tfile: {fp}");
			}
			var outFile = Path.Combine(dirName, "scripts/main.js");
			if (File.Exists(outFile))
				File.Delete(outFile);
			File.WriteAllText(outFile, sb.ToString());
			Console.WriteLine($"File {outFile} written");
		}

		public void WriteBundleWebCompiler(String dirName)
		{ 
			var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
			var bmPath = ConfigurationManager.AppSettings["bundlerMinifier"];
			if (bmPath == null)
				throw new ConfigurationErrorsException("Bundler path is not specified in app.config");
			String bundlerPath = Path.Combine(appDataPath, bmPath);

			//@"Microsoft\VisualStudio\15.0_1705bee0\Extensions\lh1eakt1.nnl\BundlerMinifierConsole.exe");

			if (!File.Exists(bundlerPath))
				throw new FileNotFoundException("update bundler path");
			ProcessStartInfo psi = new ProcessStartInfo(bundlerPath, Path.Combine(dirName, "bundleconfig.json"))
			{
				UseShellExecute = false,
				RedirectStandardOutput = false
			};
			System.Diagnostics.Process.Start(psi).WaitForExit();
		}
	}
}
