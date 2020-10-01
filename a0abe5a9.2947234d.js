(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{77:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return c})),n.d(t,"rightToc",(function(){return p})),n.d(t,"default",(function(){return s}));var r=n(2),a=n(6),o=(n(0),n(91)),i={id:"arg",title:"Arg",sidebar_label:"Arg"},c={unversionedId:"api/arg",id:"api/arg",isDocsHomePage:!1,title:"Arg",description:"Arg allows referring to other arguments in header of a",source:"@site/docs/api/arg.md",permalink:"/engine/docs/api/arg",editUrl:"https://github.com/code11/engine/edit/master/docs/docs/api/arg.md",sidebar_label:"Arg",sidebar:"docs",previous:{title:"Prop",permalink:"/engine/docs/api/prop"},next:{title:"Param",permalink:"/engine/docs/api/param"}},p=[],l={rightToc:p};function s(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"Arg")," allows referring to other arguments in header of a\n",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"/docs/api/producer"}),"producer")," or ",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"/docs/api/view"}),"view"),"."),Object(o.b)("p",null,"For example, given a ",Object(o.b)("inlineCode",{parentName:"p"},"TodoItem")," component which accepts a single arg ",Object(o.b)("inlineCode",{parentName:"p"},"id:\nstring"),", and global state which looks like:"),Object(o.b)("pre",null,Object(o.b)("code",Object(r.a)({parentName:"pre"},{className:"language-ts"}),'{\n  todosById: {\n    todo1: { title: "My first todo" }\n  },\n  tagsByTitle: {\n    "My first todo": ["tag1", "tag2"]\n  }\n}\n')),Object(o.b)("p",null,"It is possible to access tags for the Todo with ",Object(o.b)("inlineCode",{parentName:"p"},"id"),", by composing path using\n",Object(o.b)("inlineCode",{parentName:"p"},"Arg"),":"),Object(o.b)("pre",null,Object(o.b)("code",Object(r.a)({parentName:"pre"},{className:"language-tsx"}),"const TodoItem: view = ({\n  title: Observe.todosById[Prop.id],\n  tags: Observe.tagsByTitle[Arg.title]\n}) => { ... }\n")),Object(o.b)("p",null,"In this example, ",Object(o.b)("inlineCode",{parentName:"p"},"TodoItem")," will have access to ",Object(o.b)("inlineCode",{parentName:"p"},'tags = ["tag1", "tag2"]'),"."),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"Arg")," is also very useful with combined with\n",Object(o.b)("a",Object(r.a)({parentName:"p"},{href:"/docs/api/wildcard"}),"Wildcard")))}s.isMDXComponent=!0},91:function(e,t,n){"use strict";n.d(t,"a",(function(){return b})),n.d(t,"b",(function(){return m}));var r=n(0),a=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=a.a.createContext({}),s=function(e){var t=a.a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},b=function(e){var t=s(e.components);return a.a.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},u=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),b=s(n),u=r,m=b["".concat(i,".").concat(u)]||b[u]||d[u]||o;return n?a.a.createElement(m,c(c({ref:t},l),{},{components:n})):a.a.createElement(m,c({ref:t},l))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=u;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c.mdxType="string"==typeof e?e:r,i[1]=c;for(var l=2;l<o;l++)i[l]=n[l];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);