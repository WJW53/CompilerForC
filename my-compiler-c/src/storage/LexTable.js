let specTable = {
	wordType:
	{
		keyWord: 100,
		operator: 200,
		boundary: 300,
		integer: 400,
		character: 500,
		string: 600,
		id: 700,
		float: 800
	},
	keyWord:
	{
		main: 101,
		int: 102,
		if: 103,
		else: 104,
		while: 105,
		for: 106,
		read: 107,
		write: 108,
		bool: 109,
		break: 110,
		case: 111,
		catch: 112,
		char: 113,
		class: 114,
		const: 115,
		continue: 116,
		default: 117,
		delete: 118,
		do: 119,
		double: 120,
		enum: 121,
		false: 122,
		true: 123,
		float: 124,
		friend: 125,
		goto: 126,
		inline: 127,
		long: 128,
		new: 129,
		private: 130,
		protected: 131,
		public: 132,
		return: 133,
		short: 134,
		signed: 135,
		sizeof: 136,
		static: 137,
		struct: 138,
		switch: 139,
		this: 140,
		try: 141,
		typedef: 142,
		unsigned: 143,
		using: 144,
		virtual: 145,
		void: 146,
		include: 147,
		iostream: 148,
		namespace: 149,
		std: 150,
		define: 151,
		printf: 152,
		scanf: 153,
		extern: 154,
		register: 155,
		union: 156,
	},
	boudary:
	{
		'{': 301,
		'}': 302,
		'[': 303,
		']': 304,
		';': 305,
		',': 306,
		':': 307,
		'"': 308,
		'\'': 309,
		'/*': 310,
		'*/': 311,
		'//': 312,
		'#': 313
	},
	operator:
	{
		'(': 201,
		')': 202,
		'++': 240,
		'--': 241,
		'!': 205,
		'*': 206,
		'/': 207,
		'%': 208,
		'+': 209,
		'-': 242,
		'<': 211,
		'<=': 212,
		'>': 213,
		'>=': 214,
		'==': 215,
		'!=': 216,
		'&&': 217,
		'||': 218,
		'=': 219,
		//',': 220,//保险起见不写这俩了
		//'sizeof': 221,
		'>>': 222,
		'<<': 223,
		'>>=': 224,
		'<<=': 225,
		'&=': 226,
		'|=': 227,
		'^=': 228,
		'?:': 229,
		'+=': 230,
		'-=': 231,
		'*=': 232,
		'/=': 233,
		'%=': 234,
		'&': 236,//取地址和按位与,后置与前置++等,这些 符号相同,含义不同的,..嘶...
		'.': 237,
		'->': 238,
		'~': 239
	},
};

export default specTable;


// const specTable = {//种别表
// 	//要不还是直接二维数组吧,完后,每个元素的内容依次是类别,编码,单词
// 	keyWord: [//关键字表
// 		[101, "main"],
// 		[102, "int"],
// 		[103, "if"],
// 		[104, "else"],
// 		[105, "while"],
// 		[106, "for"],
// 		[107, "read"],
// 		[108, "write"],
// 		[109, "bool"],
// 		[110, "break"],
// 		[111, "case"],
// 		[112, "catch"],
// 		[113, "char"],
// 		[114, "class"],
// 		[115, "const"],
// 		[116, "continue"],
// 		[117, "default"],
// 		[118, "delete"],
// 		[119, "do"],
// 		[120, "double"],
// 		[121, "enum"],
// 		[122, "false"],
// 		[123, "true"],
// 		[124, "float"],
// 		[125, "friend"],
// 		[126, "goto"],
// 		[127, "inline"],
// 		[128, "long"],
// 		[129, "new"],
// 		[130, "private"],
// 		[131, "protected"],
// 		[132, "public"],
// 		[133, "return"],
// 		[134, "short"],
// 		[135, "signed"],
// 		[136, "sizeof"],
// 		[137, "static"],
// 		[138, "struct"],
// 		[139, "switch"],
// 		[140, "this"],
// 		[141, "try"],
// 		[142, "typedef"],
// 		[143, "unsigned"],
// 		[144, "using"],
// 		[145, "virtual"],
// 		[146, "void"],
// 		[147, "include"],
// 		[148, "iostream"],
// 		[149, "namespace"],
// 		[150, "std"],
// 		[151, "define"],
// 		[152, "printf"],
// 		[153, "scanf"],
// 	],
// 	boudary: [//界符表
// 		[301, "{"],
// 		[302, "}"],
// 		[303, "["],
// 		[304, "]"],
// 		[305, ";"],
// 		[306, ","],
// 		[307, ":"],//case ch:
// 		[308, '"'],
// 		[309, "'"],
// 		[310, "/*"],
// 		[311, "*/"],
// 		[312, "//"],
// 		[313, "#"],
// 	],
// 	operator: [//运算符表
// 		[201, "("],
// 		[202, ")"],
// 		[203, "++"],//前置++
// 		[204, "--"],
// 		[205, "!"],
// 		[206, "*"],
// 		[207, "/"],
// 		[208, "%"],
// 		[209, "+"],
// 		[210, "-"],//减
// 		[211, "<"],
// 		[212, "<="],
// 		[213, ">"],
// 		[214, ">="],
// 		[215, "=="],
// 		[216, "!="],
// 		[217, "&&"],
// 		[218, "||"],
// 		[219, "="],
// 		[220, ","],
// 		[221, "sizeof"],
// 		[222, ">>"],
// 		[223, "<<"],
// 		[224, ">>="],
// 		[225, "<<="],
// 		[226, "&="],
// 		[227, "|="],
// 		[228, "^="],
// 		[229, "?:"],
// 		[230, "+="],
// 		[231, "-="],
// 		[232, "*="],
// 		[233, "/="],
// 		[234, "%="],
// 		[235, "&"],//取地址
// 		[236, "&"],//按位与
// 		[237, "."],//成员选择对象
// 		[238, "->"],//成员选择(指针)
// 		[239, "~"],//按位取反
// 		[240, "++"],//后置++
// 		[241, "--"],//后置--
// 		[242, "-"],//负号

// 		//还有什么&=,&&=,|,^这些玩意儿的....
// 	],
// 	wordType: [//单词类别表
// 		[100, "keyWord"],
// 		[200, "operator"],
// 		[300, "boundary"],
// 		[400, "integer"],
// 		[500, "character"],
// 		[600, "string"],
// 		[700, "id"],
// 		[800, "float"],
// 	]
// }

// let obj = {};
// for (let key in specTable) {
// 	obj[key] = {};
// 	for (let i = 0; i < specTable[key].length; i++) {
// 		let temp = specTable[key][i];
// 		obj[key][temp[1]] = temp[0];
// 	}
// }
// console.log(obj);
