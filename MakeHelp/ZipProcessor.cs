// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.IO;
using System.IO.Compression;

namespace MakeHelp
{
	class ZipProcessor
	{
		String _fileName;
		String _dirName;

		public String FileName => _fileName;

		public Boolean Process(String dir)
		{
			_dirName = dir;
			var apacheFile = ConfigurationManager.AppSettings["apacheFile"];
			if (String.IsNullOrEmpty(apacheFile))
				return false;
			_fileName = Path.Combine(dir, "..\\..\\apache.zip");
			_fileName = Path.GetFullPath(_fileName);
			WriteFile();
			return true;
		}

		void WriteFile()
		{
			if (File.Exists(_fileName))
				File.Delete(_fileName);

			String[] rootFiles = { "index.html", "404.html", "robots.txt", ".htaccess", "root.php", "sitemap.txt", "favicon.ico" };

			using (var za = ZipFile.Open(_fileName, ZipArchiveMode.Create))
			{
				foreach (var rf in rootFiles)
				{
					String fn = Path.Combine(_dirName, rf);
					za.CreateEntryFromFile(fn, rf);
				}
				AddFilesFromDirectory(za, "css");
				AddFilesFromDirectory(za, "scripts");
				AddFilesFromDirectory(za, "html");
			}
		}

		void AddFilesFromDirectory(ZipArchive za, String dir)
		{
			String srcDir = Path.Combine(_dirName, dir);
			foreach (var f in Directory.GetFiles(srcDir))
			{
				String fn = Path.GetFileName(f);
				za.CreateEntryFromFile(f, Path.Combine(dir, fn).Replace("\\", "/"));
			}
			foreach (var d in Directory.GetDirectories(srcDir))
			{
				String subDir = Path.Combine(dir, Path.GetFileName(d)).Replace("\\", "/");
				AddFilesFromDirectory(za, subDir);
			}
		}
	}
}
