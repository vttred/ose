/**
 * @file Contains tests for handlebars helpers
 */
// eslint-disable-next-line prettier/prettier, import/no-cycle
import { QuenchMethods } from "../../e2e";

export const key = "ose.helpers.handlebars";
export const options = {
  displayName: "OSE: Helpers: Handlebars",
};

export default ({ describe, it, expect }: QuenchMethods) => {
  describe("registerHelpers()", () => {
    describe("eq helper", () => {
      const helper = "eq";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        expect(Handlebars.helpers.eq(1, 1)).equal(true);
        expect(Handlebars.helpers.eq("test", "test")).equal(true);
        expect(Handlebars.helpers.eq(1, 2)).equal(false);
        expect(Handlebars.helpers.eq("test", 1)).equal(false);
        expect(Handlebars.helpers.eq([], [])).equal(false);
      });
    });

    describe("mod helper", () => {
      const helper = "mod";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        expect(Handlebars.helpers.mod(0)).equal("0");
        expect(Handlebars.helpers.mod(1)).equal("+1");
        expect(Handlebars.helpers.mod(-1)).equal("-1");
        expect(Handlebars.helpers.mod("1")).equal("+1");
        expect(Handlebars.helpers.mod("-1")).equal("-1");
        expect(Handlebars.helpers.mod("a")).equal("0");
      });
    });

    describe("add helper", () => {
      const helper = "add";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        expect(Handlebars.helpers.add(1, 2)).equal(3);
        expect(Handlebars.helpers.add(1, -2)).equal(-1);
        expect(Handlebars.helpers.add("1", "3")).equal(4);
        expect(Handlebars.helpers.add("1", "-3")).equal(-2);
      });
    });

    describe("subtract helper", () => {
      const helper = "subtract";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        expect(Handlebars.helpers.subtract(1, 2)).equal(-1);
        expect(Handlebars.helpers.subtract(1, -2)).equal(3);
        expect(Handlebars.helpers.subtract("1", "3")).equal(-2);
        expect(Handlebars.helpers.subtract("1", "-3")).equal(4);
      });
    });

    describe("divide helper", () => {
      const helper = "divide";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        expect(Handlebars.helpers.divide(1, 2)).equal(0);
        expect(Handlebars.helpers.divide(1, -2)).equal(-1);
        expect(Handlebars.helpers.divide(10, 3)).equal(3);
        expect(Handlebars.helpers.divide("10", "3")).equal(3);
        expect(Handlebars.helpers.divide("10", "-3")).equal(-4);
      });
    });

    describe("mult helper", () => {
      const helper = "mult";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        expect(Handlebars.helpers.mult(1, 2)).equal(2);
        expect(Handlebars.helpers.mult(1, -2)).equal(-2);
        expect(Handlebars.helpers.mult(10, 3)).equal(30);
        expect(Handlebars.helpers.mult("10", "3")).equal(30);
        expect(Handlebars.helpers.mult("10", "-3")).equal(-30);
        expect(Handlebars.helpers.mult(0.1, 2)).equal(0.2);
        expect(Handlebars.helpers.mult(0.01, 1)).equal(0.01);
        expect(Handlebars.helpers.mult(0.001, 1)).equal(0);
      });
    });

    describe("roundWeight helper", () => {
      const helper = "roundWeight";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        expect(Handlebars.helpers.roundWeight(10.1)).equal(0);
        expect(Handlebars.helpers.roundWeight(100.1)).equal(0.1);
        expect(Handlebars.helpers.roundWeight(1000.1)).equal(1);
      });
    });

    describe("getTagIcon helper", () => {
      const helper = "getTagIcon";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      describe("is functional", () => {
        const tags = Object.keys(CONFIG.OSE.tags);
        tags.forEach((tag) => {
          it(`for ${tag} tag`, async () => {
            expect(Handlebars.helpers.getTagIcon(CONFIG.OSE.tags[tag])).equal(
              CONFIG.OSE.tag_images[tag]
            );
          });
        });
      });
    });

    describe("counter helper", () => {
      const helper = "counter";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        expect(Handlebars.helpers.counter(true, 12, 10)).equal(100);
        expect(Handlebars.helpers.counter(true, -10, 10)).equal(0);
        expect(Handlebars.helpers.counter(true, 3, 10)).equal(30);
        expect(Handlebars.helpers.counter(true, 33, 100)).equal(33);
        expect(Handlebars.helpers.counter(true, 100, 400)).equal(25);
        expect(Handlebars.helpers.counter(false, 12, 10)).equal(0);
        expect(Handlebars.helpers.counter(false, -10, 10)).equal(100);
        expect(Handlebars.helpers.counter(false, 3, 10)).equal(70);
        expect(Handlebars.helpers.counter(false, 33, 100)).equal(67);
        expect(Handlebars.helpers.counter(false, 100, 400)).equal(75);
      });
    });

    describe("times helper", () => {
      const helper = "times";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        const block = {
          fn: (i) => i,
        };
        expect(Handlebars.helpers.times(2, block)).equal("01");
        expect(Handlebars.helpers.times(5, block)).equal("01234");
      });
    });

    describe("path helper", () => {
      const helper = "path";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        expect(Handlebars.helpers.path("/test")).equal(
          `${CONFIG.OSE.systemPath()}/test`
        );
      });
    });

    describe("asset helper", () => {
      const helper = "asset";
      it("is registered", () => {
        expect(Object.keys(Handlebars.helpers)).contain(helper);
      });

      it("is functional", () => {
        expect(Handlebars.helpers.asset("/test")).equal(
          `${CONFIG.OSE.assetsPath}/test`
        );
      });
    });
  });
};
