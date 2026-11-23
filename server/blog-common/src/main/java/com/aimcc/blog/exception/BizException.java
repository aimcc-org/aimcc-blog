package com.aimcc.blog.exception;

import com.aimcc.blog.common.ErrorCode;
import lombok.Getter;

/**
 * 业务异常：表示「业务规则上的失败」（查无此文、参数不对等），不是程序 bug
 */
@Getter
public class BizException extends RuntimeException {

    /** 业务错误码（会作为 ApiResult.code 返回给前端） */
    private final int code;

    /** 用错误码的默认文案 */
    public BizException(ErrorCode errorCode) {
        this(errorCode.getCode(), errorCode.getDefaultMessage());
    }

    /** 用错误码 + 更具体的业务文案 */
    public BizException(ErrorCode errorCode, String message) {
        this(errorCode.getCode(), message);
    }

    public BizException(int code, String message) {
        super(message);     // 把 message 交给父类 Throwable 保存，之后 getMessage() 能取到
        this.code = code;
    }
}
