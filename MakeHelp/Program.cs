using System;
using System.Collections.Generic;
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
            
            Console.WriteLine(hp.GetIndex());
            Console.WriteLine(hp.GetFts());
        }
    }
}
