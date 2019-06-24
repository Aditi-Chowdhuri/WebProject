import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import { renderIntoDocument, Simulate } from "react-addons-test-utils";
import { findDOMNode } from "react-dom";

import Form from "../src";
import {
  createComponent,
  createFormComponent,
  createSandbox,
  setProps,
} from "./test_utils";

describe("Form", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Empty schema", () => {
    it("should render a form tag", () => {
      const { node } = createFormComponent({ schema: {} });

      expect(node.tagName).eql("FORM");
    });

    it("should render a submit button", () => {
      const { node } = createFormComponent({ schema: {} });

      expect(node.querySelectorAll("button[type=submit]")).to.have.length.of(1);
    });

    it("should render children buttons", () => {
      const props = { schema: {} };
      const comp = renderIntoDocument(
        <Form {...props}>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );
      const node = findDOMNode(comp);
      expect(node.querySelectorAll("button[type=submit]")).to.have.length.of(2);
    });
  });

  describe("on component creation", () => {
    let comp;
    let onChangeProp;
    let formData;
    let schema;

    function createComponent() {
      comp = renderIntoDocument(
        <Form schema={schema} onChange={onChangeProp} formData={formData}>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );
    }

    beforeEach(() => {
      onChangeProp = sinon.spy();
      schema = {
        type: "object",
        title: "root object",
        required: ["count"],
        properties: {
          count: {
            type: "number",
            default: 789,
          },
        },
      };
    });

    describe("when props.formData does not equal the default values", () => {
      beforeEach(() => {
        formData = {
          foo: 123,
        };
        createComponent();
      });

      it("should call props.onChange with current state", () => {
        sinon.assert.calledOnce(onChangeProp);
        sinon.assert.calledWith(onChangeProp, comp.state);
      });
    });

    describe("when props.formData equals the default values", () => {
      beforeEach(() => {
        formData = {
          count: 789,
        };
        createComponent();
      });

      it("should not call props.onChange", () => {
        sinon.assert.notCalled(onChangeProp);
      });
    });
  });

  describe("Option idPrefix", function() {
    it("should change the rendered ids", function() {
      const schema = {
        type: "object",
        title: "root object",
        required: ["foo"],
        properties: {
          count: {
            type: "number",
          },
        },
      };
      const comp = renderIntoDocument(<Form schema={schema} idPrefix="rjsf" />);
      const node = findDOMNode(comp);
      const inputs = node.querySelectorAll("input");
      const ids = [];
      for (var i = 0, len = inputs.length; i < len; i++) {
        const input = inputs[i];
        ids.push(input.getAttribute("id"));
      }
      expect(ids).to.eql(["rjsf_count"]);
      expect(node.querySelector("fieldset").id).to.eql("rjsf");
    });
  });

  describe("Changing idPrefix", function() {
    it("should work with simple example", function() {
      const schema = {
        type: "object",
        title: "root object",
        required: ["foo"],
        properties: {
          count: {
            type: "number",
          },
        },
      };
      const comp = renderIntoDocument(<Form schema={schema} idPrefix="rjsf" />);
      const node = findDOMNode(comp);
      const inputs = node.querySelectorAll("input");
      const ids = [];
      for (var i = 0, len = inputs.length; i < len; i++) {
        const input = inputs[i];
        ids.push(input.getAttribute("id"));
      }
      expect(ids).to.eql(["rjsf_count"]);
      expect(node.querySelector("fieldset").id).to.eql("rjsf");
    });

    it("should work with oneOf", function() {
      const schema = {
        $schema: "http://json-schema.org/draft-06/schema#",
        type: "object",
        properties: {
          connector: {
            type: "string",
            enum: ["aws", "gcp"],
            title: "Provider",
            default: "aws",
          },
        },
        dependencies: {
          connector: {
            oneOf: [
              {
                type: "object",
                properties: {
                  connector: {
                    type: "string",
                    enum: ["aws"],
                  },
                  key_aws: {
                    type: "string",
                  },
                },
              },
              {
                type: "object",
                properties: {
                  connector: {
                    type: "string",
                    enum: ["gcp"],
                  },
                  key_gcp: {
                    type: "string",
                  },
                },
              },
            ],
          },
        },
      };

      const comp = renderIntoDocument(<Form schema={schema} idPrefix="rjsf" />);
      const node = findDOMNode(comp);
      const inputs = node.querySelectorAll("input");
      const ids = [];
      for (var i = 0, len = inputs.length; i < len; i++) {
        const input = inputs[i];
        ids.push(input.getAttribute("id"));
      }
      expect(ids).to.eql(["rjsf_key_aws"]);
    });
  });

  describe("Custom field template", () => {
    const schema = {
      type: "object",
      title: "root object",
      required: ["foo"],
      properties: {
        foo: {
          type: "string",
          description: "this is description",
          minLength: 32,
        },
      },
    };

    const uiSchema = {
      foo: {
        "ui:help": "this is help",
      },
    };

    const formData = { foo: "invalid" };

    function FieldTemplate(props) {
      const {
        id,
        classNames,
        label,
        help,
        rawHelp,
        required,
        description,
        rawDescription,
        errors,
        rawErrors,
        children,
      } = props;
      return (
        <div className={"my-template " + classNames}>
          <label htmlFor={id}>
            {label}
            {required ? "*" : null}
          </label>
          {description}
          {children}
          {errors}
          {help}
          <span className="raw-help">
            {`${rawHelp} rendered from the raw format`}
          </span>
          <span className="raw-description">
            {`${rawDescription} rendered from the raw format`}
          </span>
          {rawErrors ? (
            <ul>
              {rawErrors.map((error, i) => (
                <li key={i} className="raw-error">
                  {error}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    }

    let node;

    beforeEach(() => {
      node = createFormComponent({
        schema,
        uiSchema,
        formData,
        FieldTemplate,
        liveValidate: true,
      }).node;
    });

    it("should use the provided field template", () => {
      expect(node.querySelector(".my-template")).to.exist;
    });

    it("should use the provided template for labels", () => {
      expect(node.querySelector(".my-template > label").textContent).eql(
        "root object"
      );
      expect(
        node.querySelector(".my-template .field-string > label").textContent
      ).eql("foo*");
    });

    it("should pass description as the provided React element", () => {
      expect(node.querySelector("#root_foo__description").textContent).eql(
        "this is description"
      );
    });

    it("should pass rawDescription as a string", () => {
      expect(node.querySelector(".raw-description").textContent).eql(
        "this is description rendered from the raw format"
      );
    });

    it("should pass errors as the provided React component", () => {
      expect(node.querySelectorAll(".error-detail li")).to.have.length.of(1);
    });

    it("should pass rawErrors as an array of strings", () => {
      expect(node.querySelectorAll(".raw-error")).to.have.length.of(1);
    });

    it("should pass help as a the provided React element", () => {
      expect(node.querySelector(".help-block").textContent).eql("this is help");
    });

    it("should pass rawHelp as a string", () => {
      expect(node.querySelector(".raw-help").textContent).eql(
        "this is help rendered from the raw format"
      );
    });
  });

  describe("Custom submit buttons", () => {
    it("should submit the form when clicked", done => {
      let submitCount = 0;
      const onSubmit = () => {
        submitCount++;
        if (submitCount === 2) {
          done();
        }
      };

      const comp = renderIntoDocument(
        <Form onSubmit={onSubmit} schema={{}}>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );
      const node = findDOMNode(comp);
      const buttons = node.querySelectorAll("button[type=submit]");
      buttons[0].click();
      buttons[1].click();
    });
  });

  describe("Schema definitions", () => {
    it("should use a single schema definition reference", () => {
      const schema = {
        definitions: {
          testdef: { type: "string" },
        },
        $ref: "#/definitions/testdef",
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll("input[type=text]")).to.have.length.of(1);
    });

    it("should handle multiple schema definition references", () => {
      const schema = {
        definitions: {
          testdef: { type: "string" },
        },
        type: "object",
        properties: {
          foo: { $ref: "#/definitions/testdef" },
          bar: { $ref: "#/definitions/testdef" },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll("input[type=text]")).to.have.length.of(2);
    });

    it("should handle deeply referenced schema definitions", () => {
      const schema = {
        definitions: {
          testdef: { type: "string" },
        },
        type: "object",
        properties: {
          foo: {
            type: "object",
            properties: {
              bar: { $ref: "#/definitions/testdef" },
            },
          },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll("input[type=text]")).to.have.length.of(1);
    });

    it("should handle references to deep schema definitions", () => {
      const schema = {
        definitions: {
          testdef: {
            type: "object",
            properties: {
              bar: { type: "string" },
            },
          },
        },
        type: "object",
        properties: {
          foo: { $ref: "#/definitions/testdef/properties/bar" },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll("input[type=text]")).to.have.length.of(1);
    });

    it("should handle referenced definitions for array items", () => {
      const schema = {
        definitions: {
          testdef: { type: "string" },
        },
        type: "object",
        properties: {
          foo: {
            type: "array",
            items: { $ref: "#/definitions/testdef" },
          },
        },
      };

      const { node } = createFormComponent({
        schema,
        formData: {
          foo: ["blah"],
        },
      });

      expect(node.querySelectorAll("input[type=text]")).to.have.length.of(1);
    });

    it("should raise for non-existent definitions referenced", () => {
      const schema = {
        type: "object",
        properties: {
          foo: { $ref: "#/definitions/nonexistent" },
        },
      };

      expect(() => createFormComponent({ schema })).to.Throw(
        Error,
        /#\/definitions\/nonexistent/
      );
    });

    it("should propagate referenced definition defaults", () => {
      const schema = {
        definitions: {
          testdef: { type: "string", default: "hello" },
        },
        $ref: "#/definitions/testdef",
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelector("input[type=text]").value).eql("hello");
    });

    it("should propagate nested referenced definition defaults", () => {
      const schema = {
        definitions: {
          testdef: { type: "string", default: "hello" },
        },
        type: "object",
        properties: {
          foo: { $ref: "#/definitions/testdef" },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelector("input[type=text]").value).eql("hello");
    });

    it("should propagate referenced definition defaults for array items", () => {
      const schema = {
        definitions: {
          testdef: { type: "string", default: "hello" },
        },
        type: "array",
        items: {
          $ref: "#/definitions/testdef",
        },
      };

      const { node } = createFormComponent({ schema });

      Simulate.click(node.querySelector(".array-item-add button"));

      expect(node.querySelector("input[type=text]").value).eql("hello");
    });

    it("should recursively handle referenced definitions", () => {
      const schema = {
        $ref: "#/definitions/node",
        definitions: {
          node: {
            type: "object",
            properties: {
              name: { type: "string" },
              children: {
                type: "array",
                items: {
                  $ref: "#/definitions/node",
                },
              },
            },
          },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelector("#root_children_0_name")).to.not.exist;

      Simulate.click(node.querySelector(".array-item-add button"));

      expect(node.querySelector("#root_children_0_name")).to.exist;
    });

    it("should follow recursive references", () => {
      const schema = {
        definitions: {
          bar: { $ref: "#/definitions/qux" },
          qux: { type: "string" },
        },
        type: "object",
        required: ["foo"],
        properties: {
          foo: { $ref: "#/definitions/bar" },
        },
      };
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll("input[type=text]")).to.have.length.of(1);
    });

    it("should follow multiple recursive references", () => {
      const schema = {
        definitions: {
          bar: { $ref: "#/definitions/bar2" },
          bar2: { $ref: "#/definitions/qux" },
          qux: { type: "string" },
        },
        type: "object",
        required: ["foo"],
        properties: {
          foo: { $ref: "#/definitions/bar" },
        },
      };
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll("input[type=text]")).to.have.length.of(1);
    });

    it("should handle recursive references to deep schema definitions", () => {
      const schema = {
        definitions: {
          testdef: {
            $ref: "#/definitions/testdefref",
          },
          testdefref: {
            type: "object",
            properties: {
              bar: { type: "string" },
            },
          },
        },
        type: "object",
        properties: {
          foo: { $ref: "#/definitions/testdef/properties/bar" },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll("input[type=text]")).to.have.length.of(1);
    });

    it("should handle multiple recursive references to deep schema definitions", () => {
      const schema = {
        definitions: {
          testdef: {
            $ref: "#/definitions/testdefref1",
          },
          testdefref1: {
            $ref: "#/definitions/testdefref2",
          },
          testdefref2: {
            type: "object",
            properties: {
              bar: { type: "string" },
            },
          },
        },
        type: "object",
        properties: {
          foo: { $ref: "#/definitions/testdef/properties/bar" },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll("input[type=text]")).to.have.length.of(1);
    });

    it("should priorize definition over schema type property", () => {
      // Refs bug #140
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          childObj: {
            type: "object",
            $ref: "#/definitions/childObj",
          },
        },
        definitions: {
          childObj: {
            type: "object",
            properties: {
              otherName: { type: "string" },
            },
          },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll("input[type=text]")).to.have.length.of(2);
    });

    it("should priorize local properties over definition ones", () => {
      // Refs bug #140
      const schema = {
        type: "object",
        properties: {
          foo: {
            title: "custom title",
            $ref: "#/definitions/objectDef",
          },
        },
        definitions: {
          objectDef: {
            type: "object",
            title: "definition title",
            properties: {
              field: { type: "string" },
            },
          },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelector("legend").textContent).eql("custom title");
    });

    it("should propagate and handle a resolved schema definition", () => {
      const schema = {
        definitions: {
          enumDef: { type: "string", enum: ["a", "b"] },
        },
        type: "object",
        properties: {
          name: { $ref: "#/definitions/enumDef" },
        },
      };

      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll("option")).to.have.length.of(3);
    });
  });

  describe("Default value handling on clear", () => {
    const schema = {
      type: "string",
      default: "foo",
    };

    it("should not set default when a text field is cleared", () => {
      const { node } = createFormComponent({ schema, formData: "bar" });

      Simulate.change(node.querySelector("input"), {
        target: { value: "" },
      });

      expect(node.querySelector("input").value).eql("");
    });
  });

  describe("Defaults array items default propagation", () => {
    const schema = {
      type: "object",
      title: "lvl 1 obj",
      properties: {
        object: {
          type: "object",
          title: "lvl 2 obj",
          properties: {
            array: {
              type: "array",
              items: {
                type: "object",
                title: "lvl 3 obj",
                properties: {
                  bool: {
                    type: "boolean",
                    default: true,
                  },
                },
              },
            },
          },
        },
      },
    };

    it("should propagate deeply nested defaults to form state", done => {
      const { comp, node } = createFormComponent({ schema });

      Simulate.click(node.querySelector(".array-item-add button"));
      Simulate.submit(node);

      // For some reason this may take some time to render, hence the safe wait.
      setTimeout(() => {
        expect(comp.state.formData).eql({
          object: {
            array: [
              {
                bool: true,
              },
            ],
          },
        });
        done();
      }, 250);
    });
  });

  describe("Submit handler", () => {
    it("should call provided submit handler with form state", () => {
      const schema = {
        type: "object",
        properties: {
          foo: { type: "string" },
        },
      };
      const formData = {
        foo: "bar",
      };
      const onSubmit = sandbox.spy();
      const event = { type: "submit" };
      const { comp, node } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      Simulate.submit(node, event);
      sinon.assert.calledWithMatch(onSubmit, comp.state, event);
    });

    it("should not call provided submit handler on validation errors", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
            minLength: 1,
          },
        },
      };
      const formData = {
        foo: "",
      };
      const onSubmit = sandbox.spy();
      const onError = sandbox.spy();
      const { node } = createFormComponent({
        schema,
        formData,
        onSubmit,
        onError,
      });

      Simulate.submit(node);

      sinon.assert.notCalled(onSubmit);
    });

    it("should call getUsedFormData when the omitExtraData prop is true", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
        },
      };
      const formData = {
        foo: "",
      };
      const onSubmit = sandbox.spy();
      const onError = sandbox.spy();
      const omitExtraData = true;
      const { comp, node } = createFormComponent({
        schema,
        formData,
        onSubmit,
        onError,
        omitExtraData,
      });

      sandbox.stub(comp, "getUsedFormData").returns({
        foo: "",
      });

      Simulate.submit(node);

      sinon.assert.calledOnce(comp.getUsedFormData);
    });
  });

  describe("getUsedFormData", () => {
    it("should just return the single input form value", () => {
      const schema = {
        title: "A single-field form",
        type: "string",
      };
      const formData = "foo";
      const onSubmit = sandbox.spy();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const result = comp.getUsedFormData(formData, []);
      expect(result).eql("foo");
    });

    it("should call getUsedFormData with data from fields in event", () => {
      const schema = {
        type: "object",
        properties: {
          foo: { type: "string" },
        },
      };
      const formData = {
        foo: "bar",
      };
      const onSubmit = sandbox.spy();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const result = comp.getUsedFormData(formData, ["foo"]);
      expect(result).eql({ foo: "bar" });
    });

    it("unused form values should be omitted", () => {
      const schema = {
        type: "object",
        properties: {
          foo: { type: "string" },
          baz: { type: "string" },
          list: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                details: { type: "string" },
              },
            },
          },
        },
      };

      const formData = {
        foo: "bar",
        baz: "buzz",
        list: [
          { title: "title0", details: "details0" },
          { title: "title1", details: "details1" },
        ],
      };
      const onSubmit = sandbox.spy();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const result = comp.getUsedFormData(formData, [
        "foo",
        "list.0.title",
        "list.1.details",
      ]);
      expect(result).eql({
        foo: "bar",
        list: [{ title: "title0" }, { details: "details1" }],
      });
    });
  });

  describe("getFieldNames()", () => {
    it("should return an empty array for a single input form", () => {
      const schema = {
        type: "string",
      };

      const formData = "foo";

      const onSubmit = sandbox.spy();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const pathSchema = {
        $name: "",
      };

      const fieldNames = comp.getFieldNames(pathSchema, formData);
      expect(fieldNames).eql([]);
    });

    it("should get field names from pathSchema", () => {
      const schema = {};

      const formData = {
        extra: {
          foo: "bar",
        },
        level1: {
          level2: "test",
          anotherThing: {
            anotherThingNested: "abc",
            extra: "asdf",
            anotherThingNested2: 0,
          },
        },
        level1a: 1.23,
      };

      const onSubmit = sandbox.spy();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const pathSchema = {
        $name: "",
        level1: {
          $name: "level1",
          level2: { $name: "level1.level2" },
          anotherThing: {
            $name: "level1.anotherThing",
            anotherThingNested: {
              $name: "level1.anotherThing.anotherThingNested",
            },
            anotherThingNested2: {
              $name: "level1.anotherThing.anotherThingNested2",
            },
          },
        },
        level1a: {
          $name: "level1a",
        },
      };

      const fieldNames = comp.getFieldNames(pathSchema, formData);
      expect(fieldNames.sort()).eql(
        [
          "level1a",
          "level1.level2",
          "level1.anotherThing.anotherThingNested",
          "level1.anotherThing.anotherThingNested2",
        ].sort()
      );
    });

    it("should get field names from pathSchema with array", () => {
      const schema = {};

      const formData = {
        address_list: [
          {
            street_address: "21, Jump Street",
            city: "Babel",
            state: "Neverland",
          },
          {
            street_address: "1234 Schema Rd.",
            city: "New York",
            state: "Arizona",
          },
        ],
      };

      const onSubmit = sandbox.spy();
      const { comp } = createFormComponent({
        schema,
        formData,
        onSubmit,
      });

      const pathSchema = {
        $name: "",
        address_list: {
          "0": {
            $name: "address_list.0",
            city: {
              $name: "address_list.0.city",
            },
            state: {
              $name: "address_list.0.state",
            },
            street_address: {
              $name: "address_list.0.street_address",
            },
          },
          "1": {
            $name: "address_list.1",
            city: {
              $name: "address_list.1.city",
            },
            state: {
              $name: "address_list.1.state",
            },
            street_address: {
              $name: "address_list.1.street_address",
            },
          },
        },
      };

      const fieldNames = comp.getFieldNames(pathSchema, formData);
      expect(fieldNames.sort()).eql(
        [
          "address_list.0.city",
          "address_list.0.state",
          "address_list.0.street_address",
          "address_list.1.city",
          "address_list.1.state",
          "address_list.1.street_address",
        ].sort()
      );
    });
  });

  describe("Change handler", () => {
    it("should call provided change handler on form state change", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
        },
      };
      const formData = {
        foo: "",
      };
      const onChange = sandbox.spy();
      const { node } = createFormComponent({
        schema,
        formData,
        onChange,
      });

      Simulate.change(node.querySelector("[type=text]"), {
        target: { value: "new" },
      });

      sinon.assert.calledWithMatch(onChange, {
        formData: {
          foo: "new",
        },
      });
    });

    it("should call getUsedFormData when the omitExtraData prop is true and liveValidate is true", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
        },
      };
      const formData = {
        foo: "bar",
      };
      const onChange = sandbox.spy();
      const omitExtraData = true;
      const liveValidate = true;
      const { node, comp } = createFormComponent({
        schema,
        formData,
        onChange,
        omitExtraData,
        liveValidate,
      });

      sandbox.stub(comp, "getUsedFormData").returns({
        foo: "",
      });

      Simulate.change(node.querySelector("[type=text]"), {
        target: { value: "new" },
      });

      sinon.assert.calledOnce(comp.getUsedFormData);
    });

    it("should not call getUsedFormData when the omitExtraData prop is true and liveValidate is false", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
        },
      };
      const formData = {
        foo: "bar",
      };
      const onChange = sandbox.spy();
      const omitExtraData = true;
      const liveValidate = false;
      const { node, comp } = createFormComponent({
        schema,
        formData,
        onChange,
        omitExtraData,
        liveValidate,
      });

      sandbox.stub(comp, "getUsedFormData").returns({
        foo: "",
      });

      Simulate.change(node.querySelector("[type=text]"), {
        target: { value: "new" },
      });

      sinon.assert.notCalled(comp.getUsedFormData);
    });
  });
  describe("Blur handler", () => {
    it("should call provided blur handler on form input blur event", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
        },
      };
      const formData = {
        foo: "",
      };
      const onBlur = sandbox.spy();
      const { node } = createFormComponent({ schema, formData, onBlur });

      const input = node.querySelector("[type=text]");
      Simulate.blur(input, {
        target: { value: "new" },
      });

      sinon.assert.calledWithMatch(onBlur, input.id, "new");
    });
  });

  describe("Focus handler", () => {
    it("should call provided focus handler on form input focus event", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
        },
      };
      const formData = {
        foo: "",
      };
      const onFocus = sandbox.spy();
      const { node } = createFormComponent({ schema, formData, onFocus });

      const input = node.querySelector("[type=text]");
      Simulate.focus(input, {
        target: { value: "new" },
      });

      sinon.assert.calledWithMatch(onFocus, input.id, "new");
    });
  });

  describe("Error handler", () => {
    it("should call provided error handler on validation errors", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
            minLength: 1,
          },
        },
      };
      const formData = {
        foo: "",
      };
      const onError = sandbox.spy();
      const { node } = createFormComponent({ schema, formData, onError });

      Simulate.submit(node);

      sinon.assert.calledOnce(onError);
    });
  });

  describe("Schema and external formData updates", () => {
    let comp;
    let onChangeProp;

    beforeEach(() => {
      onChangeProp = sinon.spy();
      const formProps = {
        schema: {
          type: "string",
          default: "foobar",
        },
        formData: "some value",
        onChange: onChangeProp,
      };
      comp = createFormComponent(formProps).comp;
    });

    describe("when the form data is set to null", () => {
      beforeEach(() => comp.componentWillReceiveProps({ formData: null }));

      it("should call onChange", () => {
        sinon.assert.calledOnce(onChangeProp);
        sinon.assert.calledWith(onChangeProp, comp.state);
        expect(comp.state.formData).eql("foobar");
      });
    });

    describe("when the schema default is changed but formData is not changed", () => {
      const newSchema = {
        type: "string",
        default: "the new default",
      };

      beforeEach(() =>
        comp.componentWillReceiveProps({
          schema: newSchema,
          formData: "some value",
        })
      );

      it("should not call onChange", () => {
        sinon.assert.notCalled(onChangeProp);
        expect(comp.state.formData).eql("some value");
        expect(comp.state.schema).deep.eql(newSchema);
      });
    });

    describe("when the schema default is changed and formData is changed", () => {
      const newSchema = {
        type: "string",
        default: "the new default",
      };

      beforeEach(() =>
        comp.componentWillReceiveProps({
          schema: newSchema,
          formData: "something else",
        })
      );

      it("should not call onChange", () => {
        sinon.assert.notCalled(onChangeProp);
        expect(comp.state.formData).eql("something else");
        expect(comp.state.schema).deep.eql(newSchema);
      });
    });

    describe("when the schema default is changed and formData is nulled", () => {
      const newSchema = {
        type: "string",
        default: "the new default",
      };

      beforeEach(() =>
        comp.componentWillReceiveProps({ schema: newSchema, formData: null })
      );

      it("should call onChange", () => {
        sinon.assert.calledOnce(onChangeProp);
        sinon.assert.calledWith(onChangeProp, comp.state);
        expect(comp.state.formData).eql("the new default");
      });
    });

    describe("when the onChange prop sets formData to a falsey value", () => {
      class TestForm extends React.Component {
        constructor() {
          super();

          this.state = {
            formData: {},
          };
        }

        onChange = () => {
          this.setState({ formData: this.props.falseyValue });
        };

        render() {
          const schema = {
            type: "object",
            properties: {
              value: {
                type: "string",
              },
            },
          };
          return (
            <Form
              onChange={this.onChange}
              schema={schema}
              formData={this.state.formData}
            />
          );
        }
      }

      const falseyValues = [0, false, null, undefined, NaN];

      falseyValues.forEach(falseyValue => {
        it("Should not crash due to 'Maximum call stack size exceeded...'", () => {
          // It is expected that this will throw an error due to non-matching propTypes,
          // so the error message needs to be inspected
          try {
            createComponent(TestForm, { falseyValue });
          } catch (e) {
            expect(e.message).to.not.equal("Maximum call stack size exceeded");
          }
        });
      });
    });
  });

  describe("External formData updates", () => {
    describe("root level", () => {
      const formProps = {
        schema: { type: "string" },
        liveValidate: true,
      };

      it("should update form state from new formData prop value", () => {
        const { comp } = createFormComponent(formProps);

        comp.componentWillReceiveProps({ formData: "yo" });

        expect(comp.state.formData).eql("yo");
      });

      it("should validate formData when the schema is updated", () => {
        const { comp } = createFormComponent(formProps);

        comp.componentWillReceiveProps({
          formData: "yo",
          schema: { type: "number" },
        });

        expect(comp.state.errors).to.have.length.of(1);
        expect(comp.state.errors[0].stack).to.eql("should be number");
      });
    });

    describe("object level", () => {
      it("should update form state from new formData prop value", () => {
        const { comp } = createFormComponent({
          schema: {
            type: "object",
            properties: {
              foo: {
                type: "string",
              },
            },
          },
        });

        comp.componentWillReceiveProps({ formData: { foo: "yo" } });

        expect(comp.state.formData).eql({ foo: "yo" });
      });
    });

    describe("array level", () => {
      it("should update form state from new formData prop value", () => {
        const schema = {
          type: "array",
          items: {
            type: "string",
          },
        };
        const { comp } = createFormComponent({ schema });

        comp.componentWillReceiveProps({ formData: ["yo"] });

        expect(comp.state.formData).eql(["yo"]);
      });
    });
  });

  describe("Error contextualization", () => {
    describe("on form state updated", () => {
      const schema = {
        type: "string",
        minLength: 8,
      };

      describe("Lazy validation", () => {
        it("should not update the errorSchema when the formData changes", () => {
          const { comp, node } = createFormComponent({ schema });

          Simulate.change(node.querySelector("input[type=text]"), {
            target: { value: "short" },
          });

          expect(comp.state.errorSchema).eql({});
        });

        it("should not denote an error in the field", () => {
          const { node } = createFormComponent({ schema });

          Simulate.change(node.querySelector("input[type=text]"), {
            target: { value: "short" },
          });

          expect(node.querySelectorAll(".field-error")).to.have.length.of(0);
        });

        it("should clean contextualized errors up when they're fixed", () => {
          const altSchema = {
            type: "object",
            properties: {
              field1: { type: "string", minLength: 8 },
              field2: { type: "string", minLength: 8 },
            },
          };
          const { node } = createFormComponent({
            schema: altSchema,
            formData: {
              field1: "short",
              field2: "short",
            },
          });

          function submit(node) {
            try {
              Simulate.submit(node);
            } catch (err) {
              // Validation is expected to fail and call console.error, which is
              // stubbed to actually throw in createSandbox().
            }
          }

          submit(node);

          // Fix the first field
          Simulate.change(node.querySelectorAll("input[type=text]")[0], {
            target: { value: "fixed error" },
          });
          submit(node);

          expect(node.querySelectorAll(".field-error")).to.have.length.of(1);

          // Fix the second field
          Simulate.change(node.querySelectorAll("input[type=text]")[1], {
            target: { value: "fixed error too" },
          });
          submit(node);

          // No error remaining, shouldn't throw.
          Simulate.submit(node);

          expect(node.querySelectorAll(".field-error")).to.have.length.of(0);
        });
      });

      describe("Live validation", () => {
        it("should update the errorSchema when the formData changes", () => {
          const { comp, node } = createFormComponent({
            schema,
            liveValidate: true,
          });

          Simulate.change(node.querySelector("input[type=text]"), {
            target: { value: "short" },
          });

          expect(comp.state.errorSchema).eql({
            __errors: ["should NOT be shorter than 8 characters"],
          });
        });

        it("should denote the new error in the field", () => {
          const { node } = createFormComponent({
            schema,
            liveValidate: true,
          });

          Simulate.change(node.querySelector("input[type=text]"), {
            target: { value: "short" },
          });

          expect(node.querySelectorAll(".field-error")).to.have.length.of(1);
          expect(
            node.querySelector(".field-string .error-detail").textContent
          ).eql("should NOT be shorter than 8 characters");
        });
      });

      describe("Disable validation onChange event", () => {
        it("should not update errorSchema when the formData changes", () => {
          const { comp, node } = createFormComponent({
            schema,
            noValidate: true,
            liveValidate: true,
          });

          Simulate.change(node.querySelector("input[type=text]"), {
            target: { value: "short" },
          });

          expect(comp.state.errorSchema).eql({});
        });
      });

      describe("Disable validation onSubmit event", () => {
        it("should not update errorSchema when the formData changes", () => {
          const { comp, node } = createFormComponent({
            schema,
            noValidate: true,
          });

          Simulate.change(node.querySelector("input[type=text]"), {
            target: { value: "short" },
          });
          Simulate.submit(node);

          expect(comp.state.errorSchema).eql({});
        });
      });
    });

    describe("on form submitted", () => {
      const schema = {
        type: "string",
        minLength: 8,
      };

      it("should update the errorSchema on form submission", () => {
        const { comp, node } = createFormComponent({
          schema,
          onError: () => {},
        });

        Simulate.change(node.querySelector("input[type=text]"), {
          target: { value: "short" },
        });
        Simulate.submit(node);

        expect(comp.state.errorSchema).eql({
          __errors: ["should NOT be shorter than 8 characters"],
        });
      });

      it("should call the onError handler", () => {
        const onError = sandbox.spy();
        const { node } = createFormComponent({ schema, onError });

        Simulate.change(node.querySelector("input[type=text]"), {
          target: { value: "short" },
        });
        Simulate.submit(node);

        sinon.assert.calledWithMatch(
          onError,
          sinon.match(value => {
            return (
              value.length === 1 &&
              value[0].message === "should NOT be shorter than 8 characters"
            );
          })
        );
      });

      it("should reset errors and errorSchema state to initial state after correction and resubmission", () => {
        const onError = sandbox.spy();
        const { comp, node } = createFormComponent({
          schema,
          onError,
        });

        Simulate.change(node.querySelector("input[type=text]"), {
          target: { value: "short" },
        });
        Simulate.submit(node);

        expect(comp.state.errorSchema).eql({
          __errors: ["should NOT be shorter than 8 characters"],
        });
        expect(comp.state.errors.length).eql(1);
        sinon.assert.calledOnce(onError);

        Simulate.change(node.querySelector("input[type=text]"), {
          target: { value: "long enough" },
        });
        Simulate.submit(node);

        expect(comp.state.errorSchema).eql({});
        expect(comp.state.errors).eql([]);
        sinon.assert.calledOnce(onError);
      });
    });

    describe("root level", () => {
      const formProps = {
        liveValidate: true,
        schema: {
          type: "string",
          minLength: 8,
        },
        formData: "short",
      };

      it("should reflect the contextualized error in state", () => {
        const { comp } = createFormComponent(formProps);

        expect(comp.state.errorSchema).eql({
          __errors: ["should NOT be shorter than 8 characters"],
        });
      });

      it("should denote the error in the field", () => {
        const { node } = createFormComponent(formProps);

        expect(node.querySelectorAll(".field-error")).to.have.length.of(1);
        expect(
          node.querySelector(".field-string .error-detail").textContent
        ).eql("should NOT be shorter than 8 characters");
      });
    });

    describe("root level with multiple errors", () => {
      const formProps = {
        liveValidate: true,
        schema: {
          type: "string",
          minLength: 8,
          pattern: "d+",
        },
        formData: "short",
      };

      it("should reflect the contextualized error in state", () => {
        const { comp } = createFormComponent(formProps);
        expect(comp.state.errorSchema).eql({
          __errors: [
            "should NOT be shorter than 8 characters",
            'should match pattern "d+"',
          ],
        });
      });

      it("should denote the error in the field", () => {
        const { node } = createFormComponent(formProps);

        const liNodes = node.querySelectorAll(".field-string .error-detail li");
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(errors).eql([
          "should NOT be shorter than 8 characters",
          'should match pattern "d+"',
        ]);
      });
    });

    describe("nested field level", () => {
      const schema = {
        type: "object",
        properties: {
          level1: {
            type: "object",
            properties: {
              level2: {
                type: "string",
                minLength: 8,
              },
            },
          },
        },
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: {
          level1: {
            level2: "short",
          },
        },
      };

      it("should reflect the contextualized error in state", () => {
        const { comp } = createFormComponent(formProps);

        expect(comp.state.errorSchema).eql({
          level1: {
            level2: {
              __errors: ["should NOT be shorter than 8 characters"],
            },
          },
        });
      });

      it("should denote the error in the field", () => {
        const { node } = createFormComponent(formProps);
        const errorDetail = node.querySelector(
          ".field-object .field-string .error-detail"
        );

        expect(node.querySelectorAll(".field-error")).to.have.length.of(1);
        expect(errorDetail.textContent).eql(
          "should NOT be shorter than 8 characters"
        );
      });
    });

    describe("array indices", () => {
      const schema = {
        type: "array",
        items: {
          type: "string",
          minLength: 4,
        },
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: ["good", "bad", "good"],
      };

      it("should contextualize the error for array indices", () => {
        const { comp } = createFormComponent(formProps);

        expect(comp.state.errorSchema).eql({
          1: {
            __errors: ["should NOT be shorter than 4 characters"],
          },
        });
      });

      it("should denote the error in the item field in error", () => {
        const { node } = createFormComponent(formProps);
        const fieldNodes = node.querySelectorAll(".field-string");

        const liNodes = fieldNodes[1].querySelectorAll(
          ".field-string .error-detail li"
        );
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(fieldNodes[1].classList.contains("field-error")).eql(true);
        expect(errors).eql(["should NOT be shorter than 4 characters"]);
      });

      it("should not denote errors on non impacted fields", () => {
        const { node } = createFormComponent(formProps);
        const fieldNodes = node.querySelectorAll(".field-string");

        expect(fieldNodes[0].classList.contains("field-error")).eql(false);
        expect(fieldNodes[2].classList.contains("field-error")).eql(false);
      });
    });

    describe("nested array indices", () => {
      const schema = {
        type: "object",
        properties: {
          level1: {
            type: "array",
            items: {
              type: "string",
              minLength: 4,
            },
          },
        },
      };

      const formProps = { schema, liveValidate: true };

      it("should contextualize the error for nested array indices", () => {
        const { comp } = createFormComponent({
          ...formProps,
          formData: {
            level1: ["good", "bad", "good", "bad"],
          },
        });

        expect(comp.state.errorSchema).eql({
          level1: {
            1: {
              __errors: ["should NOT be shorter than 4 characters"],
            },
            3: {
              __errors: ["should NOT be shorter than 4 characters"],
            },
          },
        });
      });

      it("should denote the error in the nested item field in error", () => {
        const { node } = createFormComponent({
          ...formProps,
          formData: {
            level1: ["good", "bad", "good"],
          },
        });

        const liNodes = node.querySelectorAll(".field-string .error-detail li");
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(errors).eql(["should NOT be shorter than 4 characters"]);
      });
    });

    describe("nested arrays", () => {
      const schema = {
        type: "object",
        properties: {
          outer: {
            type: "array",
            items: {
              type: "array",
              items: {
                type: "string",
                minLength: 4,
              },
            },
          },
        },
      };

      const formData = {
        outer: [["good", "bad"], ["bad", "good"]],
      };

      const formProps = { schema, formData, liveValidate: true };

      it("should contextualize the error for nested array indices", () => {
        const { comp } = createFormComponent(formProps);

        expect(comp.state.errorSchema).eql({
          outer: {
            0: {
              1: {
                __errors: ["should NOT be shorter than 4 characters"],
              },
            },
            1: {
              0: {
                __errors: ["should NOT be shorter than 4 characters"],
              },
            },
          },
        });
      });

      it("should denote the error in the nested item field in error", () => {
        const { node } = createFormComponent(formProps);
        const fields = node.querySelectorAll(".field-string");
        const errors = [].map.call(fields, field => {
          const li = field.querySelector(".error-detail li");
          return li && li.textContent;
        });

        expect(errors).eql([
          null,
          "should NOT be shorter than 4 characters",
          "should NOT be shorter than 4 characters",
          null,
        ]);
      });
    });

    describe("array nested items", () => {
      const schema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            foo: {
              type: "string",
              minLength: 4,
            },
          },
        },
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: [{ foo: "good" }, { foo: "bad" }, { foo: "good" }],
      };

      it("should contextualize the error for array nested items", () => {
        const { comp } = createFormComponent(formProps);

        expect(comp.state.errorSchema).eql({
          1: {
            foo: {
              __errors: ["should NOT be shorter than 4 characters"],
            },
          },
        });
      });

      it("should denote the error in the array nested item", () => {
        const { node } = createFormComponent(formProps);
        const fieldNodes = node.querySelectorAll(".field-string");

        const liNodes = fieldNodes[1].querySelectorAll(
          ".field-string .error-detail li"
        );
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(fieldNodes[1].classList.contains("field-error")).eql(true);
        expect(errors).eql(["should NOT be shorter than 4 characters"]);
      });
    });

    describe("schema dependencies", () => {
      const schema = {
        type: "object",
        properties: {
          branch: {
            type: "number",
            enum: [1, 2, 3],
            default: 1,
          },
        },
        required: ["branch"],
        dependencies: {
          branch: {
            oneOf: [
              {
                properties: {
                  branch: {
                    enum: [1],
                  },
                  field1: {
                    type: "number",
                  },
                },
                required: ["field1"],
              },
              {
                properties: {
                  branch: {
                    enum: [2],
                  },
                  field1: {
                    type: "number",
                  },
                  field2: {
                    type: "number",
                  },
                },
                required: ["field1", "field2"],
              },
            ],
          },
        },
      };

      it("should only show error for property in selected branch", () => {
        const { comp, node } = createFormComponent({
          schema,
          liveValidate: true,
        });

        Simulate.change(node.querySelector("input[type=number]"), {
          target: { value: "not a number" },
        });

        expect(comp.state.errorSchema).eql({
          field1: {
            __errors: ["should be number"],
          },
        });
      });

      it("should only show errors for properties in selected branch", () => {
        const { comp, node } = createFormComponent({
          schema,
          liveValidate: true,
          formData: { branch: 2 },
        });

        Simulate.change(node.querySelector("input[type=number]"), {
          target: { value: "not a number" },
        });

        expect(comp.state.errorSchema).eql({
          field1: {
            __errors: ["should be number"],
          },
          field2: {
            __errors: ["is a required property"],
          },
        });
      });

      it("should not show any errors when branch is empty", () => {
        const { comp, node } = createFormComponent({
          schema,
          liveValidate: true,
          formData: { branch: 3 },
        });

        Simulate.change(node.querySelector("select"), {
          target: { value: 3 },
        });

        expect(comp.state.errorSchema).eql({});
      });
    });
  });

  describe("Schema and formData updates", () => {
    // https://github.com/mozilla-services/react-jsonschema-form/issues/231
    const schema = {
      type: "object",
      properties: {
        foo: { type: "string" },
        bar: { type: "string" },
      },
    };

    it("should replace state when formData have keys removed", () => {
      const formData = { foo: "foo", bar: "bar" };
      const { comp, node } = createFormComponent({ schema, formData });
      comp.componentWillReceiveProps({
        schema: {
          type: "object",
          properties: {
            bar: { type: "string" },
          },
        },
        formData: { bar: "bar" },
      });

      Simulate.change(node.querySelector("#root_bar"), {
        target: { value: "baz" },
      });

      expect(comp.state.formData).eql({ bar: "baz" });
    });

    it("should replace state when formData keys have changed", () => {
      const formData = { foo: "foo", bar: "bar" };
      const { comp, node } = createFormComponent({ schema, formData });
      comp.componentWillReceiveProps({
        schema: {
          type: "object",
          properties: {
            foo: { type: "string" },
            baz: { type: "string" },
          },
        },
        formData: { foo: "foo", baz: "bar" },
      });

      Simulate.change(node.querySelector("#root_baz"), {
        target: { value: "baz" },
      });

      expect(comp.state.formData).eql({ foo: "foo", baz: "baz" });
    });
  });

  describe("idSchema updates based on formData", () => {
    const schema = {
      type: "object",
      properties: {
        a: { type: "string", enum: ["int", "bool"] },
      },
      dependencies: {
        a: {
          oneOf: [
            {
              properties: {
                a: { enum: ["int"] },
              },
            },
            {
              properties: {
                a: { enum: ["bool"] },
                b: { type: "boolean" },
              },
            },
          ],
        },
      },
    };

    it("should not update idSchema for a falsey value", () => {
      const formData = { a: "int" };
      const { comp } = createFormComponent({ schema, formData });
      comp.componentWillReceiveProps({
        schema: {
          type: "object",
          properties: {
            a: { type: "string", enum: ["int", "bool"] },
          },
          dependencies: {
            a: {
              oneOf: [
                {
                  properties: {
                    a: { enum: ["int"] },
                  },
                },
                {
                  properties: {
                    a: { enum: ["bool"] },
                    b: { type: "boolean" },
                  },
                },
              ],
            },
          },
        },
        formData: { a: "int" },
      });
      expect(comp.state.idSchema).eql({ $id: "root", a: { $id: "root_a" } });
    });

    it("should update idSchema based on truthy value", () => {
      const formData = {
        a: "int",
      };
      const { comp } = createFormComponent({ schema, formData });
      comp.componentWillReceiveProps({
        schema: {
          type: "object",
          properties: {
            a: { type: "string", enum: ["int", "bool"] },
          },
          dependencies: {
            a: {
              oneOf: [
                {
                  properties: {
                    a: { enum: ["int"] },
                  },
                },
                {
                  properties: {
                    a: { enum: ["bool"] },
                    b: { type: "boolean" },
                  },
                },
              ],
            },
          },
        },
        formData: { a: "bool" },
      });
      expect(comp.state.idSchema).eql({
        $id: "root",
        a: { $id: "root_a" },
        b: { $id: "root_b" },
      });
    });
  });

  describe("Form disable prop", () => {
    const schema = {
      type: "object",
      properties: {
        foo: { type: "string" },
        bar: { type: "string" },
      },
    };
    const formData = { foo: "foo", bar: "bar" };

    it("should enable all items", () => {
      const { node } = createFormComponent({ schema, formData });

      expect(node.querySelectorAll("input:disabled")).to.have.length.of(0);
    });

    it("should disable all items", () => {
      const { node } = createFormComponent({
        schema,
        formData,
        disabled: true,
      });

      expect(node.querySelectorAll("input:disabled")).to.have.length.of(2);
    });
  });

  describe("Attributes", () => {
    const formProps = {
      schema: {},
      id: "test-form",
      className: "test-class other-class",
      name: "testName",
      method: "post",
      target: "_blank",
      action: "/users/list",
      autocomplete: "off",
      enctype: "multipart/form-data",
      acceptcharset: "ISO-8859-1",
      noHtml5Validate: true,
    };

    let node;

    beforeEach(() => {
      node = createFormComponent(formProps).node;
    });

    it("should set attr id of form", () => {
      expect(node.getAttribute("id")).eql(formProps.id);
    });

    it("should set attr class of form", () => {
      expect(node.getAttribute("class")).eql(formProps.className);
    });

    it("should set attr name of form", () => {
      expect(node.getAttribute("name")).eql(formProps.name);
    });

    it("should set attr method of form", () => {
      expect(node.getAttribute("method")).eql(formProps.method);
    });

    it("should set attr target of form", () => {
      expect(node.getAttribute("target")).eql(formProps.target);
    });

    it("should set attr action of form", () => {
      expect(node.getAttribute("action")).eql(formProps.action);
    });

    it("should set attr autoComplete of form", () => {
      expect(node.getAttribute("autocomplete")).eql(formProps.autocomplete);
    });

    it("should set attr enctype of form", () => {
      expect(node.getAttribute("enctype")).eql(formProps.enctype);
    });

    it("should set attr acceptcharset of form", () => {
      expect(node.getAttribute("accept-charset")).eql(formProps.acceptcharset);
    });

    it("should set attr novalidate of form", () => {
      expect(node.getAttribute("novalidate")).not.to.be.null;
    });
  });

  describe("Custom format updates", () => {
    it("Should update custom formats when customFormats is changed", () => {
      const formProps = {
        liveValidate: true,
        formData: {
          areaCode: "123455",
        },
        schema: {
          type: "object",
          properties: {
            areaCode: {
              type: "string",
              format: "area-code",
            },
          },
        },
        uiSchema: {
          areaCode: {
            "ui:widget": "area-code",
          },
        },
        widgets: {
          "area-code": () => <div id="custom" />,
        },
      };

      const { comp } = createFormComponent(formProps);

      expect(comp.state.errorSchema).eql({});

      setProps(comp, {
        ...formProps,
        customFormats: {
          "area-code": /^\d{3}$/,
        },
      });

      expect(comp.state.errorSchema).eql({
        areaCode: {
          __errors: ['should match format "area-code"'],
        },
      });
    });
  });

  describe("Meta schema updates", () => {
    it("Should update allowed meta schemas when additionalMetaSchemas is changed", () => {
      const formProps = {
        liveValidate: true,
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "string",
          minLength: 8,
          pattern: "d+",
        },
        formData: "short",
        additionalMetaSchemas: [],
      };

      const { comp } = createFormComponent(formProps);

      expect(comp.state.errorSchema).eql({
        $schema: {
          __errors: [
            'no schema with key or ref "http://json-schema.org/draft-04/schema#"',
          ],
        },
      });

      setProps(comp, {
        ...formProps,
        additionalMetaSchemas: [
          require("ajv/lib/refs/json-schema-draft-04.json"),
        ],
      });

      expect(comp.state.errorSchema).eql({
        __errors: [
          "should NOT be shorter than 8 characters",
          'should match pattern "d+"',
        ],
      });

      setProps(comp, formProps);

      expect(comp.state.errorSchema).eql({
        $schema: {
          __errors: [
            'no schema with key or ref "http://json-schema.org/draft-04/schema#"',
          ],
        },
      });
    });
  });
});
