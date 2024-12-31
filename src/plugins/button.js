import { command } from "../functions";


// Button with text as body
command(
  { pattern: "buttontext" },
  // @ts-ignore
  async (api, params) => {
    const data = {
      text: "Please choose an option:",
      buttons: [
        { id: "hello", title: "Option 1", type: "reply" },
        { id: "button2", title: "Option 2" },
      ],
    };
    api.sendButtonText(data)
  }
);

// Button with media as body


command(
  { pattern: "buttonmedia" },
  // @ts-ignore
  async (api, params) => {
    const data = {
      text: "Please choose an option:",
      media: "https://d.rapidcdn.app/snapinsta?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3Njb250ZW50LWxheDMtMi5jZG5pbnN0YWdyYW0uY29tL28xL3YvdDE2L2YyL204Ni9BUU43am5NdGVrTmZfa1lUTDMzVl8tNGZZbDVCMGw4Y1B5UnpTQmhYWnhOdnB0ZDN1aHpwS3pXdTdyc2NCZ2tUdkRnZ0VPdlNHR05JUDYzSHVPT2d5N2VKLU14UTg1VzRFSE03WFdrLm1wND9zdHA9ZHN0LW1wNCZlZmc9ZXlKeFpWOW5jbTkxY0hNaU9pSmJYQ0pwWjE5M1pXSmZaR1ZzYVhabGNubGZkblJ6WDI5MFpsd2lYU0lzSW5abGJtTnZaR1ZmZEdGbklqb2lkblJ6WDNadlpGOTFjbXhuWlc0dVkyeHBjSE11WXpJdU56SXdMbUpoYzJWc2FXNWxJbjAmX25jX2NhdD0xMDcmdnM9NDM3MTgzOTM5MzMyNjcxXzExODk5NzI4MTkmX25jX3ZzPUhCa3NGUUlZVW1sblgzaHdkbDl5WldWc2MxOXdaWEp0WVc1bGJuUmZjM0pmY0hKdlpDODROelEyTkRVelJUVTJRekZHTXpZNFJrRTRRamMyUVRnNE4wVkdOMFk0TkY5MmFXUmxiMTlrWVhOb2FXNXBkQzV0Y0RRVkFBTElBUUFWQWhnNmNHRnpjM1JvY205MVoyaGZaWFpsY25OMGIzSmxMMGROV0ROSFFucG1XRGd3YkdWNFVVWkJTM0ZsVTJ4MWQwTlRWbVZpY1Y5RlFVRkJSaFVDQXNnQkFDZ0FHQUFiQUJVQUFDYjZyc1BXbnZXTFFCVUNLQUpETXl3WFFDb3pNek16TXpNWUVtUmhjMmhmWW1GelpXeHBibVZmTVY5Mk1SRUFkZjRIQUElM0QlM0QmX25jX3JpZD0yN2UxNGM2OTQ1JmNjYj05LTQmb2g9MDBfQVlEOV9ibHVRdHVvMXM4WkQzc2l5WHM4MHZtWC1fVUNTYXZmMGtoVmFwaFhGQSZvZT02Nzc0NDYzQiZfbmNfc2lkPTEwZDEzYiIsImZpbGVuYW1lIjoiU25hcGluc3RhLmFwcF92aWRlb19BUU43am5NdGVrTmZfa1lUTDMzVl8tNGZZbDVCMGw4Y1B5UnpTQmhYWnhOdnB0ZDN1aHpwS3pXdTdyc2NCZ2tUdkRnZ0VPdlNHR05JUDYzSHVPT2d5N2VKLU14UTg1VzRFSE03WFdrLm1wNCJ9.jWZ9TkiBpC0qjL7egSqbUrJ36daHVSte49F1MPOapFU&dl=1&dl=1",
      buttons: [
        { id: "hello", title: "Option 1", type: "reply" },
        { id: "button2", title: "Option 2" },
      ],
      footer: "This is footer"
    };
    api.sendButtonMedia(data)
  }
);


