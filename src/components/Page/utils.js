export const hold = (page, pageRef, handleActivePage) => {
    console.log("hold");
    page.isHolding = true;
    page.style.zIndex = 50;
    handleActivePage(pageRef.current);
  };
 export  const release = (page, index, noOfPages, handleActivePage) => {
    console.log("release");
    page.isHolding = false;
    if (page.isRight) {
      page.style.zIndex = noOfPages - index;
      page.style.transform = "scaleX(100%)";
    } else {
      page.style.transform = "scaleX(-100%)";
    }
    handleActivePage(null);
  };