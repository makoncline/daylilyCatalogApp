import {
  ErrorAlert,
  MarkdownInput,
  Redirect,
  SharedLayout,
} from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { NextPage } from "next";
import React from "react";

const Markdown: NextPage = () => {
  const { data, loading, error } = useSharedQuery();
  const user = data && data.currentUser;
  const tutorialText = `You can write your bio using [Markdown](https://en.wikipedia.org/wiki/Markdown)${"  "}
Markdown uses symbols to let you add formatting to plain text.${"  "}
The left side is the plain text, and the right side is the formatted output.${"  "}
Use the formatting buttons above, or type the formatting symbols yourself.${"  "}

Here are some examples to get you started.

# Headings

To make a heading, add a number sign and a space before the text (e.g., # This is a heading ).${"  "}
You can make smaller heading by adding more number signs.
## Heading 2
### Heading 3
#### Heading 4

# Text styles
You can style your text by surrounding it with certain symbols${"  "}

bold - **This text is bold**${"  "}
italics - *This text is in italics*${"  "}
strikethrough - ~~This text is strikethrough~~${"  "}

# Links
Just paste a link (e.g., https://daylilycatalog.com)${"  "}
To change the link text, surround the link text in brackets, then the url in parentheses${"  "}
[The link text surrounded by brackets](the url surrounded by parentheses)${"  "}
(e.g., [daylilyCatalog](https://daylilycatalog.com))${"  "}

# Lists
Make a bulleted list by adding an asterisk and a space before the text${"  "}

* this is
* a bullet list`;
  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!user && !loading) {
      return <Redirect href={`/login?next=${encodeURIComponent("/")}`} />;
    } else if (!user) {
      return "Loading";
    } else {
      return (
        <>
          <MarkdownInput
            handleSetBio={() => {}}
            value={tutorialText}
            height={1200}
          />
        </>
      );
    }
  })();
  const query = useSharedQuery();
  return (
    <SharedLayout title="Markdown Example" query={query}>
      {pageContent}
    </SharedLayout>
  );
};

export default Markdown;
