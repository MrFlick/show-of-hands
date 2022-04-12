using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;

namespace PowerPointObserver
{
	public class ShowOfHands : IDisposable
	{
		private static readonly HttpClient _client = new HttpClient();
		private bool _DisposedValue;
		private string _url;
		private string _token;

		public ShowOfHands(string url, string token = "") {
			_url = url;
			_token = token;
		}

		public Task Connect()
		{
			return Task.CompletedTask;
		}

		async public Task SetActiveSlide(int slide)
		{
			var values = new Dictionary<string, string>
			{
				{"slide", slide.ToString() }
			};
			var content = new FormUrlEncodedContent(values);
			await _client.PostAsync(_url + "/set-slide", content);
			await Task.CompletedTask;
		}
		async public Task ActivateSnippet(string tag)
		{
			var values = new Dictionary<string, string>
			{
				{"tag", tag }
			};
			var content = new FormUrlEncodedContent(values);
			await _client.PostAsync(_url + "/open-snippet", content);
			await Task.CompletedTask;
		}

		async public Task ActivatePoll(string tag)
		{
			var values = new Dictionary<string, string>
			{
				{"tag", tag }
			};
			var content = new FormUrlEncodedContent(values);
			await _client.PostAsync(_url + "/open-poll", content);
			await Task.CompletedTask;
		}

		protected virtual void Dispose(bool disposing)
		{
			if (!_DisposedValue)
			{
				if (disposing)
				{
					// TODO: dispose managed state (managed objects)
				}

				_DisposedValue = true;
			}
		}

		~ShowOfHands()
		{
			// Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
			Dispose(disposing: false);
		}

		public void Dispose()
		{
			// Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
			Dispose(disposing: true);
			GC.SuppressFinalize(this);
		}
	}
}