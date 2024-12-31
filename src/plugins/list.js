import { command } from "../functions";

command(
    { pattern: "listtext" },
    // @ts-ignore
    async (api, params) => {
        const data = {
            header: "Choose an option",
            body: "Please select an option from the list below:",
            footer: "Footer text here",
            button: "View Options",
            sections: [
                {
                    title: "Section 1",
                    rows: [
                        { id: "option1", title: "Option 1", description: "Description for option 1" },
                        { id: "option2", title: "Option 2", description: "Description for option 2" },
                    ],
                },
                {
                    title: "Section 2",
                    rows: [
                        { id: "option3", title: "Option 3", description: "Description for option 3" },
                        { id: "option4", title: "Option 4", description: "Description for option 4" },
                    ],
                },
            ],
        };
        api.sendList(data);
    }
);
