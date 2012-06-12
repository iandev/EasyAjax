/*
 Easy Ajax v1.2
 Author: Ian Herbert
 Email: iant.herbert@gmail.com
 Version History:	Saturday June 21 2010 v0.8
			Monday June 11 2012 v1.0
			Tuesday June 12 2012 v1.2
 Usage:
	easyAjax.init({
		defaultContent: "",		// default element to display returned content, can be any jQuery selector
		beforeRequest: "",		// this event fires directly before the ajax request
		afterRequest: "",		// this event fires directly after the ajax request
		errorRequest: "",		// this event fires in the case the ajax request returns an error
		noResponse: ""			// use this string in place of the target selector, 'a' tags is the rel attribute, forms is a field named 'target'. in these cases, the servers response will not be displayed.
	});
	
 Examples:
	<a href="/index.php" class="ajax" >Example 1</a>
	<a href="/index.php" class="ajax" rel="#footer div.class" >Example 1</a>
	<a href="/index.php" class="ajax" rel="noresponse" >Example 1</a>
	<form action="/index.php" method="GET" class="ajax" >
		<input name="q" value="" type="text" />
		<input name="target" value="#content .class" type="hidden" />
	</form>
*/

if(typeof jQuery != "undefined") {
	var easyAjax = (function ($) {
		var _private = {
			defaults: {  
				defaultContent: "#content",
				beforeRequest: function() {},
				afterRequest: function() {},
				errorRequest: function() {},
				data: {},
				noResponse: "no_response",
			},  
			
			set: function (args) {
				this.defaults.defaultContent 	= args.defaultContent 		|| this.defaults.defaultContent;
				this.defaults.beforeRequest		= args.beforeRequest 		|| this.defaults.beforeRequest;
				this.defaults.afterRequest 		= args.afterRequest 		|| this.defaults.afterRequest;
				this.defaults.errorRequest 		= args.errorRequest 		|| this.defaults.errorRequest;
				this.defaults.noResponse 		= args.noResponse 			|| this.defaults.noResponse;
			},
			
			init: function() {
				//bind all links with a class 'ajax' to this funtion
				$("a.ajax").click(_private.aClickEvent);
				//bind all forms with a class 'ajax' to this function
				$("form.ajax").submit(_private.formSubmitEvent);
				$(window).bind( 'hashchange', function(e) {_private.parseHash();});
				$(window).trigger( 'hashchange' );
			},
			
			aClickEvent: function (e) {
				e.preventDefault();
				
				var href = this.href.replace(/^[^\/]*(?:\/[^\/]*){2}/, "");
				if(href.length == 0)
					href = "/";

				if(this.rel.length > 0)
					window.location.hash = "?url=" + href + "&t=" + escape(this.rel);
				else
					window.location.hash = "?url=" + href;
								
				//for browsers that don't support "onhashchange" event
				if(!("onhashchange" in window))
					$(window).trigger( 'hashchange' );
							
				return false;
			},
			
			formSubmitEvent: function (e) {
				e.preventDefault();

				var href = this.action.replace(/^[^\/]*(?:\/[^\/]*){2}/, "");
				if(href.length == 0)
					var href = "/";
							
				var t_val = $("input[name=target]").val();
				$("input[name=target]").attr("disabled", true);
				var d = $(this).serialize();
				$("input[name=target]").attr("disabled", false);

				if(this.method=="post")
				{
					_private.defaults.data = d;
				}
				else
				{
					href = href + "?" +  d;
				}
					
				if(typeof(t_val) != "undefined" && t_val.length > 0)
				{
					if(window.location.hash == "#?url=" + href + "&t=" + escape(t_val))
						$(window).trigger( 'hashchange' );
					else
						window.location.hash = "?url=" + href + "&t=" + escape(t_val);
				}
				else
				{
					if(window.location.hash == "#?url=" + href)
						$(window).trigger( 'hashchange' );
					else
						window.location.hash = "?url=" + href;
				}
					
				//for browsers that don't support "onhashchange" event
				if(!("onhashchange" in window))
					$(window).trigger( 'hashchange' );
							
				return false;
			},
			
			parseHash: function () {
				var qry_loc = window.location.hash.indexOf("?");
				if(qry_loc > -1)
				{
					var qry = window.location.hash.substring(qry_loc+1);
					
					if(qry.indexOf("url=") > -1)
					{
						var pieces = qry.split("url=");
						if(pieces[1].length > 0)
						{
							if(pieces[1].indexOf("&t=") > -1)
							{
								var pieces2 = pieces[1].split("&t=");
								
								var url = pieces2[0];
								var target = pieces2[1];
							}
							else
								var url = pieces[1];
						}
								
							
						if(typeof(url) != 'undefined')
						{
							_private.getContent(url, target);
						}
					}
				}
			},
			
			getContent: function (href, target) {
				if(typeof(_private.defaults.beforeRequest) == "function")
					_private.defaults.beforeRequest(href);

				jQuery.ajax(
				{
					type: "POST",
					url: href,
					data: _private.defaults.data,
					dataType: "html",
					error: function(XMLHttpRequest, textStatus, errorThrown)
					{
						if(typeof(_private.defaults.errorRequest) == "function")
							_private.defaults.errorRequest(textStatus, errorThrown);
					},
					
					success: function(str)
					{
						if(str.length > 0) 
						{
							if(str != '0')
							{
								if(typeof(target) != 'undefined')
								{
									var t = unescape(target);
									if(t != _private.defaults.noResponse)
									{
										$(t).html(str);
									}
								}
								else if(_private.defaults.defaultContent.length > 0)
								{
									$(_private.defaults.defaultContent).html(str);
								}
									
								$("a.ajax").unbind("click");
								$("form.ajax").unbind("submit");
								
								$("a.ajax").click(_private.aClickEvent);
								$("form.ajax").submit(_private.formSubmitEvent);
								
								_private.defaults.data = "";
									
								if(typeof(_private.defaults.afterRequest) == "function")
									_private.defaults.afterRequest(href, str);
							}
						}
					}
				});
			}
		}
		
		return {
			init: function (args) {
				_private.set(args);
				$("document").ready(_private.init);		
			}
		}
	})(jQuery);
}