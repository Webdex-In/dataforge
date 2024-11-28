export function formatDomainUrl(url) {
    // Remove protocol (http:// or https://)
    let domain = url.replace(/^https?:\/\//, "");
  
    // Remove 'www.'
    domain = domain.replace(/^www\./, "");
  
    // Remove trailing slashes
    domain = domain.replace(/\/$/, "");
  
    return domain;
  }



export function formatUrl(link) {
    let profileId;
  
    // Check if it's an /in/ or /sales/ link
    if (link.includes("/in/")) {
      profileId = link.split("/in/")[1].split("/")[0];
    } else if (link.includes("/sales/")) {
      profileId = link.split("/lead/")[1].split(",")[0];
    } else {
      return "Invalid LinkedIn URL";
    }
  
    // Return the formatted LinkedIn URL
    return `https://www.linkedin.com/in/${profileId}`;
  }
  