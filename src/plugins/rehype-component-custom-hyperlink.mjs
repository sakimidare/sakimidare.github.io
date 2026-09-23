/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Hyperlink Card Component with manual avatar and description
 *
 * 用法（container 指令，正文作为描述）：
 *   :::link{href="..." title="..." avatar="..."}
 *   描述文本
 *   :::
 *
 * @param {Object} properties
 * @param {string} properties.href - 卡片跳转链接
 * @param {string} properties.title - 标题
 * @param {string} properties.avatar - 头像 URL
 * @param {string} properties.description - 描述（容器正文为空时的兜底）
 * @param {import('mdast').RootContent[]} children - children（作为描述渲染）
 * @returns {import('mdast').Parent}
 */
export function HyperlinkCardComponent(properties, children) {
	const {
		href = "#",
		title = "Title",
		avatar = "",
		description = "",
	} = properties;

	const descriptionNodes =
		Array.isArray(children) && children.length > 0
			? children
			: description
				? [h("p", description)]
				: [];

	const nAvatar = h("div", {
		class: "hc-avatar",
		style: `background-image:url('${avatar}');`,
	});

	return h(
		"a",
		{
			class: "card-hyperlink no-styling",
			href,
			target: "_blank",
			rel: "noopener noreferrer",
		},
		[
			h("div", { class: "hc-titlebar" }, [
				nAvatar,
				h("div", { class: "hc-title" }, title),
			]),
			h("div", { class: "hc-description" }, descriptionNodes),
		],
	);
}
