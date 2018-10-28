// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;

namespace MakeHelp
{
	class Program
	{
		static void Main(String[] args)
		{
			if (args.Length == 0)
			{
				Console.WriteLine("Usage: makehelp [directory]");
				return;
			}
			String dir = args[0].ToLowerInvariant();
			Console.WriteLine($"Processing: {dir}");

			var hp = new HelpProcessor();
			hp.Process(dir);

			hp.MakeContent(dir + "\\content.txt");

			String jsFile = hp.MakeJsFile();
			String contentFileName = $"{dir}\\app\\content.js";
			Console.WriteLine();
			Console.WriteLine($"Generating content file: {contentFileName}");
			File.WriteAllText(contentFileName, jsFile);

			Console.WriteLine();
			hp.WriteBundle(dir);
			Console.WriteLine();

			var zp = new ZipProcessor();
			if (zp.Process(dir))
			{
				Console.WriteLine();
				Console.WriteLine($"Generating zip file: {zp.FileName}");
				Console.WriteLine();
			}
		}
	}
}
