import Giscus from "@giscus/react";
import * as React from "react";

const id = "inject-comments";

// 获取 localStorage 中 theme 的值
function getSavedTheme() {
	return window.localStorage.getItem("theme") || "auto";
}

// 获取系统主题
function getSystemTheme(): "light" | "dark" {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

// giscus 只接受 light/dark 等合法主题值，auto 需要解析成实际明暗
function getGiscusTheme(): "light" | "dark" {
	const saved = getSavedTheme();
	if (saved === "dark") {
		return "dark";
	}
	if (saved === "light") {
		return "light";
	}
	return getSystemTheme();
}

const Comments = () => {
	const [mounted, setMounted] = React.useState(false);
	const [theme, setTheme] = React.useState<"light" | "dark">(getGiscusTheme);

	React.useEffect(() => {
		setTheme(getGiscusTheme());

		// 站点的明暗主题是通过 <html> 上的 dark class 切换的（见 setting-utils.ts）
		const observer = new MutationObserver(() => {
			setTheme(getGiscusTheme());
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		// auto 模式下跟随系统主题变化
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const onSchemeChange = () => {
			if (getSavedTheme() === "auto") {
				setTheme(getSystemTheme());
			}
		};
		mediaQuery.addEventListener("change", onSchemeChange);

		// 取消监听
		return () => {
			observer.disconnect();
			mediaQuery.removeEventListener("change", onSchemeChange);
		};
	}, []);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div id={id} className="w-full">
			{mounted ? (
				<Giscus
					id={id}
					repo="sakimidare/sakimidare.github.io"
					repoId="R_kgDOPiar0w"
					category="Announcements"
					categoryId="DIC_kwDOPiar084CuhyB"
					mapping="title"
					reactionsEnabled="1"
					emitMetadata="0"
					inputPosition="top"
					lang="zh-CN"
					loading="lazy"
					theme={theme}
				/>
			) : null}
		</div>
	);
};

export default Comments;
