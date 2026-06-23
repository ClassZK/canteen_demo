/** 正则验证 */
export const RegExpPhone = (value: string) => {
  const RegExp = /^(1[3|4|5|6|7|8|9]\d{9})$/;
  return RegExp.test(value);
};
export const RegExpEmail = (value: string) => {
  const RegExp = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,6})$/;
  return RegExp.test(value);
};

/** ElementPlus 验证 */
enum validatorType {
  passwordType = 1,
  phoneType = 1,
}
export const validatorPassword = (type = 1) => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      if (type === validatorType.passwordType) {
        const RegExp = /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))([a-zA-Z0-9.,:;?!@#$%^&()_+*/-=]){8,30}$/;
        if (RegExp.test(value)) {
          callback();
        } else {
          callback(new Error("密码必须同时包含大小写字母和数字,且在8-30位之间"));
        }
      } else {
        const RegExp =
          /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.,:;?!@#$%^&()_+*/-=]))([a-zA-Z0-9().,:;?!@#$%^&()_+*/-=]){8,30}$/;
        if (RegExp.test(value)) {
          callback();
        } else {
          callback(new Error("密码必须同时包含大小写字母,数字和部分特殊字符,且在8-30位之间"));
        }
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入密码"));
      } else {
        callback();
      }
    }
  };
};
export const validatorPasswordPass = (data: string) => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      if (value === data) {
        callback();
      } else {
        callback(new Error("两次密码输入不一致"));
      }
    } else {
      callback(new Error("请再次输入新密码"));
    }
  };
};
export const validatorCaptcha = (name = "验证码") => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[a-zA-Z0-9]{4,6}$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error(`${name}为4-6位字符`));
      }
    } else {
      if (rule.required) {
        callback(new Error(`请输入${name}`));
      } else {
        callback();
      }
    }
  };
};

export const validatorPhone = (type = validatorType.phoneType) => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      if (type === validatorType.phoneType) {
        const RegExp = /^(1[3|4|5|6|7|8|9]\d{9})$/;
        if (RegExp.test(value)) {
          callback();
        } else {
          callback(new Error("联系电话为11位有效数字"));
        }
      } else {
        const RegExp = /(^([0-9]{7,8})$)|(^(1[3|4|5|6|7|8|9]\d{9})$)/;
        if (RegExp.test(value)) {
          callback();
        } else {
          callback(new Error("联系电话为7,8,11位有效数字"));
        }
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入联系电话"));
      } else {
        callback();
      }
    }
  };
};
export const validatorEmail = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,6})$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入邮箱"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入邮箱"));
      } else {
        callback();
      }
    }
  };
};
export const validatorChinese = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[\u4e00-\u9fa5]+$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入中文"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入中文"));
      } else {
        callback();
      }
    }
  };
};
export const validatorEnglish = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[A-Za-z]+$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入英文"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入英文"));
      } else {
        callback();
      }
    }
  };
};
export const validatorNumber = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[0-9]+$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入数字"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入数字"));
      } else {
        callback();
      }
    }
  };
};
export const validatorC_E = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[A-Za-z\u4e00-\u9fa5]+$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入中文或英文"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入中文或英文"));
      } else {
        callback();
      }
    }
  };
};
export const validatorE_N = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[A-Za-z0-9]+$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入英文或数字"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入英文或数字"));
      } else {
        callback();
      }
    }
  };
};
export const validatorC_E_N = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入中文,英文或数字"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入中文,英文或数字"));
      } else {
        callback();
      }
    }
  };
};
export const validatorEncode = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[A-Za-z0-9(+-/*_,.|~!@#$%^&φ)]+$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入英文,数字或特殊字符(+-/*_,.|~!@#$%^&φ)"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入英文,数字或特殊字符(+-/*_,.|~!@#$%^&φ)"));
      } else {
        callback();
      }
    }
  };
};
export const validatorEncode2 = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[A-Za-z_]+$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入英文或_"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入英文或_"));
      } else {
        callback();
      }
    }
  };
};
export const validatorLongitude = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("经度范围为-180~180,保留小数点后6位"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入经度"));
      } else {
        callback();
      }
    }
  };
};
export const validatorLatitude = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("纬度范围为-90~90,保留小数点后6位"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入纬度"));
      } else {
        callback();
      }
    }
  };
};
export const validatorIP = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp =
        /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入IP"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入IP"));
      } else {
        callback();
      }
    }
  };
};
export const validatorIDCard = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[1-9]\d{5}(19|(2[0-5]))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入身份证号"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入身份证号"));
      } else {
        callback();
      }
    }
  };
};
export const validatorVersion = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^\d+(\.\d+){2}$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入版本号"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入版本号"));
      } else {
        callback();
      }
    }
  };
};
// 验证年龄
export const validatorAge = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[1-9]\d{0,2}$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入年龄"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入年龄"));
      } else {
        callback();
      }
    }
  };
};
// 短信验证码
export const validatorSmsCode = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^\d{6}$/;
      if (RegExp.test(value)) {
        callback();
      } else {
        callback(new Error("请正确输入短信验证码"));
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入短信验证码"));
      } else {
        callback();
      }
    }
  };
};

// 验证大于0数
export const validatorPositiveInteger = () => {
  return function validate(rule: any, value: string, callback: any) {
    if (value) {
      const RegExp = /^[1-9]\d*$|^0$/;
      if (RegExp.test(value)) {
        callback();
      }
    } else {
      if (rule.required) {
        callback(new Error("请输入大于0的整数"));
      } else {
        callback();
      }
    }
  };
};
