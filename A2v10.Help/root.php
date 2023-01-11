<?php

header('Content-type: text/html; charset=utf-8');
$raw_url = $_SERVER['REQUEST_URI'];
if (empty($raw_url) || $raw_url == "/")
  $raw_url = "/index";
$url = "./html" . $raw_url . ".html";

if (!file_exists($url))
	$url = "./html/index.html";

$title_tag = "<title>A2v10:SDK version 10</title>";
$title_regex = "/^\s*<!--title:(.+)-->\s*$/m";

$page = file_get_contents("./index.html");
$inner = file_get_contents("./html" . $raw_url . ".html");

if (preg_match($title_regex, $inner, $matches)) {
	$title = $matches[1];
	$page = str_replace($title_tag, "<title>" . $title . "</title>", $page);
}

$page = str_replace("$(PageContent)", $inner, $page);

echo $page;

?>