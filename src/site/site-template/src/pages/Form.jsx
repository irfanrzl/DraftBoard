import React, { useState } from "react";

export default function Form({ page }) {
  const [sent, setSent] = useState(false);

  // A sensible default set of fields for a generic form / auth page.
  const isAuth = page.type === "auth";
  const fields = isAuth
    ? [
        { name: "email", label: "Email", type: "email" },
        { name: "password", label: "Password", type: "password" },
      ]
    : [
        { name: "name", label: "Name", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "message", label: "Message", type: "textarea" },
      ];

  return (
    <section className="container section narrow">
      <h1 className="page-title">{page.label}</h1>
      <p className="page-lead">
        {isAuth
          ? "Sign in to continue. Wire this up to your auth provider."
          : "A starter form. Connect it to your backend or email service."}
      </p>

      {sent ? (
        <div className="notice">
          Thanks — this is a placeholder confirmation. Hook up real submission in
          your code.
        </div>
      ) : (
        <div className="form">
          {fields.map((f) => (
            <div className="field" key={f.name}>
              <label>{f.label}</label>
              {f.type === "textarea" ? (
                <textarea rows={5} />
              ) : (
                <input type={f.type} />
              )}
            </div>
          ))}
          <button className="btn btn-primary" onClick={() => setSent(true)}>
            {isAuth ? "Sign in" : "Send"}
          </button>
        </div>
      )}
    </section>
  );
}
