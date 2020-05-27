<?php

header('Content-type: text/html; charset=utf-8');
$raw_url = $_SERVER['REQUEST_URI'];
if (empty($raw_url) || $raw_url == "/")
  $raw_url = "/index";
$url = "./html" . $raw_url . ".html";

if (!file_exists($url))
	$url = "./html/index.html";

$content_start = "<a2-include class=\"help-content-view\" :source=\"content\">";
$content_end = "</a2-include>";
$title_tag = "<title>A2v10:SDK version 10</title>";
$title_regex = "/^\s*<!--title:(.+)-->\s*$/m";

$page = file_get_contents("./index.html");

$content = file_get_contents($url);
if (substr($content, 0, 3) == "\xEF\xBB\xBF") {
	$content = substr($content, 3);
}

if (preg_match($title_regex, $content, $matches)) {
	$title = $matches[1];
	$page = str_replace($title_tag, "<title>" . $title . "</title>", $page);
}

echo str_replace($content_start . $content_end, $content_start . $content . $content_end, $page);

?>