// src/components/LinkButton.tsx
import Link from "next/link";
import React from "react";

interface Props {
  title: string;
  sectionId?: string; // Make sectionId optional
  href?: string; // Add href as an optional prop
  containerStyles?: string;
  textStyles?: string;
  icon?: React.ReactNode; // If you ever want to add an icon
}

const LinkButton = ({
  title,
  sectionId,
  href, // Destructure new href prop
  containerStyles,
  textStyles,
  icon,
}: Props) => {
  // Determine the link destination:
  // Priority to direct href, fallback to sectionId for hash links,
  // then a default if neither is provided (though one should be).
  const destination = href || (sectionId ? `#${sectionId}` : "/");

  return (
    <Link href={destination} scroll={sectionId ? false : true}>
      {" "}
      {/* scroll={false} only for hash links */}
      <div className={containerStyles}>
        {icon && <span className="mr-2">{icon}</span>}
        <p className={textStyles}>{title}</p>
      </div>
    </Link>
  );
};

export default LinkButton;
