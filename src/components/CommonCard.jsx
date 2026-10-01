import React from "react";
import "../Styles/CommonCard.css";

const CommonCard = ({
  children,
  title,
  subtitle,
  actions,
  className = "",
  variant = "default",
  onClick,
  hover = false,
  clickable = false,
  padding = true,
  as = "div",
  type,
}) => {

  const CardElement = as;

  const cardClasses = [
    "common-card",
    `common-card-${variant}`,
    hover ? "common-card-hover" : "",
    clickable ? "common-card-clickable" : "",
    padding ? "common-card-padding" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (

    <CardElement
      className={cardClasses}
      onClick={onClick}
      type={
        as === "button"
          ? type || "button"
          : undefined
      }
    >

      {(title ||
        subtitle ||
        actions) && (

        <div className="common-card-header">

          <div className="common-card-header-content">

            {title && (

              <h3 className="common-card-title">

                {title}

              </h3>

            )}

            {subtitle && (

              <p className="common-card-subtitle">

                {subtitle}

              </p>

            )}

          </div>


          {actions && (

            <div className="common-card-actions">

              {actions}

            </div>

          )}

        </div>

      )}


      <div className="common-card-body">

        {children}

      </div>

    </CardElement>

  );

};

export default CommonCard;