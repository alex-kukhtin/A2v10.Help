using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MakeHelp
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length == 0) {
                Console.WriteLine("Usage: makehelp [directory]");
            }
            String dir = args[0].ToLowerInvariant();
            Console.WriteLine($"Processing: {dir}");

            var hp = new HelpProcessor();
            hp.Process(dir);

            hp.MakeContent(dir + "\\content.txt");           

            String jsFile = hp.MakeJsFile();
            String contentFileName = $"{dir}\\app\\content.js";
            Console.WriteLine($"Generating content file: {contentFileName}");
            File.WriteAllText(contentFileName, jsFile);
        }
    }
}
