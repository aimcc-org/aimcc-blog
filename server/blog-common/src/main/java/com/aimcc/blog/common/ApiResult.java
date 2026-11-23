package com.aimcc.blog.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 统一接口响应结构：所有 Controller 返回该包装
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResult<T> {

    /** 业务状态码：200 成功 */
    private int code;
    private String message;
    private T data;

    public static <T> ApiResult<T> ok(T data) {
        return new ApiResult<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getDefaultMessage(), data);
    }

    public static ApiResult<Void> ok() {
        return ok(null);
    }

    /** 用错误码的默认文案 */
    public static <T> ApiResult<T> fail(ErrorCode errorCode) {
        return fail(errorCode.getCode(), errorCode.getDefaultMessage());
    }

    /** 用错误码的码 + 自定义文案（业务想要更具体时用这个） */
    public static <T> ApiResult<T> fail(ErrorCode errorCode, String message) {
        return fail(errorCode.getCode(), message);
    }

    /** 异常处理器里码已经存在异常对象里，直接透传用这个 */
    public static <T> ApiResult<T> fail(int code, String message) {
        return new ApiResult<>(code, message, null);
    }
}
