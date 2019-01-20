// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

using Newtonsoft.Json;

namespace MakeHelp
{
	public class ContentItem
	{
		[JsonProperty("title")]
		public String Title { get; set; }

		[JsonProperty("url")]
		public String Url { get; set; }

		[JsonProperty("items")]
		public List<ContentItem> Items { get; set; }

		Stack<ContentItem> _stack;
		Int32 _currentLevel = 0;

		public ContentItem()
		{
			_stack = new Stack<ContentItem>();
			_stack.Push(this);
		}

		public String Add(String text)
		{
			String title = null;
			String url = null;
			Int32 lev = 0;
			var vals = Regex.Split(text, "(\t+)");
			if (vals.Length == 3)
			{
				title = vals[0];
				url = vals[2];
			}
			else if (vals.Length == 5)
			{
				lev = vals[1].Length;
				title = vals[2];
				url = vals[4];
			}
			else
			{
				throw new ArgumentException($"Invalid value for '{text}'. Expected: [\t*] title \t url");
			}
			if (String.IsNullOrEmpty(title) && String.IsNullOrEmpty(url))
				return null;
			while (lev < _currentLevel)
			{
				_stack.Pop();
				_currentLevel -= 1;
			}
			if (lev > _currentLevel)
			{
				if (lev - _currentLevel > 1)
					throw new ArgumentException($"Invalid level for '{text}'");
				var itms = _stack.Peek().Items;
				_stack.Push(itms[itms.Count - 1]);
				_currentLevel = lev;
			}
			var elem = _stack.Peek();
			if (elem.Items == null)
				elem.Items = new List<ContentItem>();
			var newElem = new ContentItem
			{
				Title = title.Trim(),
				Url = url.Trim()
			};
			elem.Items.Add(newElem);
			return url.Trim();
		}
	}
}
