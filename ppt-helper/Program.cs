using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Office.Interop.PowerPoint;
using Microsoft.Office.Core;
//Thanks to CSharpFritz and EngstromJimmy for their gists, snippets, and thoughts.

namespace PowerPointObserver
{
    class Program
    {
        private static Application ppt = new Microsoft.Office.Interop.PowerPoint.Application();
        private static ShowOfHands SOH;
        private static string autoTag = string.Empty;

        static async Task Main(string[] args)
        {
            //WriteSlideIndex(); 
            Console.Write("Connecting to PowerPoint...");
            ppt.SlideShowNextSlide += App_SlideShowNextSlide;
            Console.WriteLine("connected");
            Dictionary<string, string> soh_settings = Find_SOH_Tags(ppt.ActivePresentation.Slides[1]);

            Console.Write("Connecting to Show Of Hands");
            string soh_server = soh_settings.GetValueOrDefault("server", "https://classroom.matthewflickinger.com");
            Console.Write(" (" + soh_server + ")...");
            SOH = new ShowOfHands(soh_server, "token");
            await SOH.Connect();
            Console.WriteLine("connected");

            Console.ReadLine();
        }

        static void WriteSlideIndex()
        {
            using (var sw = new StreamWriter("slides.txt"))
            {
                string tag = String.Empty;
                int index = 1;
                foreach (Microsoft.Office.Interop.PowerPoint.Slide slide in ppt.ActivePresentation.Slides)
                {
                    tag = findTagInSlide(slide);
                    sw.WriteLine(index.ToString() + "," + tag);
                    tag = string.Empty;
                    index += 1;
                }
            }
        }

        static Dictionary<string, string> Find_SOH_Tags(Slide slide)
        {
            var settings = new Dictionary<string, string>();
            var note = string.Empty;
            try { note = slide.NotesPage.Shapes[2].TextFrame.TextRange.Text; }
            catch { /*no notes*/ }
            var notereader = new StringReader(note);
            string line;
            while ((line = notereader.ReadLine()) != null)
            {
                if(line.StartsWith("#SOH"))
                {
                    string[] tokens = line.Split(' ');
                    if (tokens[1].ToLower() == "server:")
                    {
                        settings["server"] = tokens[2].Trim();
                    } 
                    else if (tokens[1].ToLower() == "snippet:")
                    {
                        settings["snippet"] = tokens[2].Trim();
                    } 
                    else if (tokens[1].ToLower() == "snippet")
                    {
                        string tag = findTagInSlide(slide);
                        if (!string.IsNullOrEmpty(tag)) {
                            settings["snippet"] = tag;
                        }
                    }
                    else if (tokens[1].ToLower() == "poll:")
                    {
                        settings["poll"] = tokens[2].Trim();
                    }
                    else if (tokens[1].ToLower() == "poll")
                    {
                        string tag = findTagInSlide(slide);
                        if (!string.IsNullOrEmpty(tag)) {
                            settings["poll"] = tag;
                        }
                    } else if (tokens[1].ToLower() == "autosnippet")
                    {
                        autoTag = "snippet";
                    }
                }
            }
            if (!string.IsNullOrEmpty(autoTag))
            {
                string tag = findTagInSlide(slide);
                if (!string.IsNullOrEmpty(tag))
                {
                    settings[autoTag] = tag;
                }
            }
            return settings;
        }

        static string findTagInSlide(Slide slide)
        {
            foreach (Microsoft.Office.Interop.PowerPoint.Shape shape in slide.Shapes)
            {
                if (shape.HasTextFrame == MsoTriState.msoTrue)
                {
                    var textFrame = shape.TextFrame;
                    if (textFrame.HasText == Microsoft.Office.Core.MsoTriState.msoTrue)
                    {
                        var textRange = textFrame.TextRange;
                        string text = textRange.Text.ToString();
                        if (text.StartsWith("#") && text.Length>1 && text[1] != ' ')
                        {
                            return text[1..].Trim();
                        }
                    }
                }
            }
            return string.Empty;
        }

        async static void App_SlideShowNextSlide(SlideShowWindow Wn)
        {
            if (Wn != null)
            {
                var slide = Wn.View.Slide;
                int slideNumber = slide.SlideNumber;
                Console.WriteLine($"Moved to Slide Number {slideNumber}");
                await SOH.SetActiveSlide(slideNumber);

                var tags = Find_SOH_Tags(slide);                

                string value = string.Empty;
                if (tags.TryGetValue("snippet", out value))
                {
                    Console.WriteLine($"Activated snippet {value}");
                    await SOH.ActivateSnippet(value) ;
                }
             }
         }
     }
}