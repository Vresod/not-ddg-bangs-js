let search = (args) => {
	if(!args[0]) {
		let query = args.q;
		let engine = args.engine || "DuckDuckGo";
		// let ddg_if_bang = Boolean(args["dib"]);
		let extracted = extract(query,bangs.bangs,bangs.shortcuts);
		console.log(extracted);
		// if(ddg_if_bang && engine !== "DuckDuckGo" && query.startsWith("!") && !extracted.bang){
		// 	if(http_get(`https://api.duckduckgo.com/?q=${query}&format=json&no_redirect=1`).Redirect) {
		// 		return engines.DuckDuckGo.replace("%s",query);
		// 	}
		// }
		if(extracted.term === `!${extracted.bang}`) {
			return get_root(`${bangs.bangs[extracted.bang].replace("%s",extracted.term)}`);
		}
		if(extracted.shortcut && extracted.term === "") {
			return get_root(`${bangs.shortcuts[extracted.bang].replace("%s",extracted.shortcut).replace("%s",extracted.term)}`);
		}
		if(extracted.shortcut) {
			return `${bangs.shortcuts[extracted.bang].replace("%s",extracted.shortcut).replace("%s",extracted.term)}`;
		}
		if(extracted.bang) {
			return `${bangs.bangs[extracted.bang].replace("%s",extracted.term)}`
		}
		return engines[engine].replace("%s",encodeURIComponent(query))
	}
}

let get_root = (url) => {
	let regex = new RegExp(/(^https?:\/\/(www\.)?[\da-zA-Z\.-]+)/);
	match = regex.exec(url);
	if(!match){
		return false;
	}
	return match[0];
}

let http_get = (url) => { // stolen from w3docs.com
	let req = new XMLHttpRequest();
	req.open("GET",url,false);
	req.send(null);
	return JSON.parse(req.responseText);
}

let extract = (bang_str,bangs,shortcuts) => {
	bang_str = String(bang_str.toLowerCase());
	let extracted = {};
	for(let shortcut in shortcuts) {
		if(bang_str.startsWith(`!${shortcut}.`)){ // shortcut situation
			extracted.bang = shortcut;
			d1 = bang_str.replace(`!${shortcut}.`,"");
 			/* the stupidest line of code in this whole thing, somehow
			 * i did this using str.split(maxsplit=1) in python and used exactly 0 str.index calls (at least not in *my* code)
			 * but js has no maxsplit option, so this was the best alternative
			 * :/
			*/
			d2 = [d1.slice(0,d1.indexOf(" ")),d1.slice(d1.indexOf(" ") + 1)]
			console.log(d2)
			extracted.shortcut = d2[0]
			extracted.term = d2.length > 1 ? d2[1] : "";
			return extracted;
		}
	};
	for(let bang in bangs) {
		// console.log(bang_str,bang)
		if(bang_str.split(" ")[0] === `!${bang}`) {
			extracted.bang = bang;
			extracted.term = bang_str.replace(`!${bang} `,"");
			extracted.shortcut = null;
			return extracted;
		}
	};
	extracted.bang = null;
	extracted.shortcut = null;
	extracted.term = bang_str;
	return extracted;
}

let raw_args = location.search.replace("?","").split("&");
let args = {};

raw_args.forEach(argument => {
	let arg = argument.split("=");
	args[arg[0]] = decodeURIComponent(arg[1].replaceAll("+"," "));
});

if(args.q === ""){
	location.replace("/?e=5");
}

location.replace(search(args));
// console.log(search(args));