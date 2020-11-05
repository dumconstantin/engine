(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{100:function(e,n,t){"use strict";t.d(n,"a",(function(){return b})),t.d(n,"b",(function(){return m}));var a=t(0),r=t.n(a);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function c(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?c(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):c(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function p(e,n){if(null==e)return{};var t,a,r=function(e,n){if(null==e)return{};var t,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var l=r.a.createContext({}),s=function(e){var n=r.a.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},b=function(e){var n=s(e.components);return r.a.createElement(l.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.a.createElement(r.a.Fragment,{},n)}},d=r.a.forwardRef((function(e,n){var t=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),b=s(t),d=a,m=b["".concat(c,".").concat(d)]||b[d]||u[d]||i;return t?r.a.createElement(m,o(o({ref:n},l),{},{components:t})):r.a.createElement(m,o({ref:n},l))}));function m(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=t.length,c=new Array(i);c[0]=d;var o={};for(var p in n)hasOwnProperty.call(n,p)&&(o[p]=n[p]);o.originalType=e,o.mdxType="string"==typeof e?e:a,c[1]=o;for(var l=2;l<i;l++)c[l]=t[l];return r.a.createElement.apply(null,c)}return r.a.createElement.apply(null,t)}d.displayName="MDXCreateElement"},72:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return c})),t.d(n,"metadata",(function(){return o})),t.d(n,"rightToc",(function(){return p})),t.d(n,"default",(function(){return s}));var a=t(2),r=t(6),i=(t(0),t(100)),c={id:"usage",title:"Usage",sidebar_label:"Usage"},o={unversionedId:"usage",id:"usage",isDocsHomePage:!1,title:"Usage",description:"Install",source:"@site/docs/usage.md",permalink:"/engine/docs/usage",editUrl:"https://github.com/code11/engine/edit/master/docs/docs/usage.md",sidebar_label:"Usage",sidebar:"docs",previous:{title:"Introduction",permalink:"/engine/docs/"},next:{title:"CLI",permalink:"/engine/docs/cli"}},p=[{value:"Install",id:"install",children:[]},{value:"Instantiate",id:"instantiate",children:[]},{value:"Build",id:"build",children:[]}],l={rightToc:p};function s(e){var n=e.components,t=Object(r.a)(e,["components"]);return Object(i.b)("wrapper",Object(a.a)({},l,t,{components:n,mdxType:"MDXLayout"}),Object(i.b)("h2",{id:"install"},"Install"),Object(i.b)("p",null,"Fastest way to get started with Engine is by using the Engine\n",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://code11.github.io/engine/docs/cli"}),"CLI"),"."),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{}),"npm i -g @c11/engine.cli\nengine create my-app\ncd my-app\nnpm start\n")),Object(i.b)("p",null,Object(i.b)("inlineCode",{parentName:"p"},"engine create <app-name>")," will setup an npm project with all the dependencies\nrequired for building an engine app installed. Engine itself is built in a\nmodular way in the form of multiple packages. You can read more about the\nEngine packages on ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"packages"}),"packages")," page."),Object(i.b)("h2",{id:"instantiate"},"Instantiate"),Object(i.b)("p",null,"To create an Engine app, an instance of the ",Object(i.b)("inlineCode",{parentName:"p"},"Engine")," class from\n",Object(i.b)("inlineCode",{parentName:"p"},"@c11/engine.macro")," need to be created. This goes in ",Object(i.b)("inlineCode",{parentName:"p"},"src/index.ts")," of a\nan app (created with engine CLI):"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-tsx"}),'import React from "react";\nimport { Engine } from "@c11/engine.react";\nimport "./index.css";\nimport App from "./App";\n\nconst engine = new Engine({\n  view: {\n    element: <App />,\n    root: "#root"\n  }\n});\n\nengine.start();\n')),Object(i.b)("p",null,"Creating an ",Object(i.b)("inlineCode",{parentName:"p"},"Engine")," instance takes care of mounting our application. It is\npossible to provide an initial state to it. More about Engine can be found in\n",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/implementations/react"}),"API docs for Engine"),"."),Object(i.b)("h2",{id:"build"},"Build"),Object(i.b)("p",null,"Engine react applications are pretty much written like any other React\napplication, with few differences:"),Object(i.b)("ol",null,Object(i.b)("li",{parentName:"ol"},"Only functional react components can become Engine ",Object(i.b)("a",Object(a.a)({parentName:"li"},{href:"/docs/api/view"}),"view"),"s"),Object(i.b)("li",{parentName:"ol"},"React components need to be labeled with ",Object(i.b)("inlineCode",{parentName:"li"},"view")," macro"),Object(i.b)("li",{parentName:"ol"},'State dependencies of a view are declared in its arguments (also called\n"header" of the view)')),Object(i.b)("p",null,"For example:"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-tsx"}),'import React from "react";\nimport { view, observe, update, producer } from "@c11/engine.macro";\n\nconst greeter: producer = ({\n  name = observe.name,\n  updateGreeting = update.greeting\n}) => {\n  if (!name) {\n    updateGreeting.set("Bye bye");\n  } else {\n    updateGreeting.set("Hello");\n  }\n};\n\nconst App: view = ({\n  name = observe.name,\n  greeting = observe.greeting,\n  updateName = update.name\n}) => {\n  return (\n    <>\n      <h1 className="App-header">\n        {greeting} {name}\n      </h1>\n      <input\n        value={name}\n        onChange={e => updateName.set(e.currentTarget.value)}\n      />\n    </>\n  );\n};\n\n(App as any).producers = [greeter];\n\nexport default App;\n')),Object(i.b)("p",null,"This tiny example demonstrates pretty much all the Engine concepts needed to use\nit!"),Object(i.b)("p",null,Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/api/view"}),"View"),"s can ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/api/observe"}),"observe")," anything from\n",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/concepts/state"}),"state"),", and ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/api/update"}),"update")," anything in the\nstate."),Object(i.b)("p",null,Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/api/producer"}),"Producer"),"s behave pretty much the same\nway as ",Object(i.b)("inlineCode",{parentName:"p"},"view"),"s, but don't render anything on screen. Producers are where the\nbusiness logic should live."),Object(i.b)("p",null,Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/tutorials/react/setup"}),"Quick start")," tutorial has a more involved\nintroduction to building an Engine app."))}s.isMDXComponent=!0}}]);