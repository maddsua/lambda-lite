import { React } from "../../deps.ts";

export default () => <>
	<html>
		<head>
			<title>Test main page</title>
		</head>
		<body>
			<h1>Yo, so this is a test page</h1>
			<p>
				Yeah coool af
			</p>
			<div>
				<p>More pages:</p>
				<ul>
					<li>
						<a href="/test">/test</a>
					</li>
					<li>
						<a href="/api">/api</a>
					</li>
					<li>
						<a href="/nested">/nested</a>
					</li>
					<li>
						<a href="/nested/named">/nested/named</a>
					</li>
				</ul>
			</div>
		</body>
	</html>
</>;
