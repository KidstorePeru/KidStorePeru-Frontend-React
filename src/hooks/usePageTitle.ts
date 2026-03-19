import { useEffect } from "react";

const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = title ? `${title} | KidStore` : "KidStore";
    return () => { document.title = "KidStore"; };
  }, [title]);
};

export default usePageTitle;