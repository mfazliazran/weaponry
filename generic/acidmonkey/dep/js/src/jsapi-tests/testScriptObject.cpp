/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * vim: set ts=8 sw=4 et tw=99:
 */

#include "tests.h"

struct ScriptObjectFixture : public JSAPITest {
    static const int code_size;
    static const char code[];
    static jschar uc_code[];

    ScriptObjectFixture()
    {
        for (int i = 0; i <= code_size; i++)
            uc_code[i] = code[i];
    }

    bool tryScript(JSScript *script)
    {
        CHECK(script);

        /* We should have allocated a script object for the script already. */
        jsvalRoot script_object(cx, OBJECT_TO_JSVAL(JS_GetScriptObject(script)));
        CHECK(JSVAL_TO_OBJECT(script_object.value()));

        /*
         * JS_NewScriptObject just returns the object already created for the
         * script. It was always a bug to call this more than once.
         */
        jsvalRoot second_script_object
            (cx, OBJECT_TO_JSVAL(JS_NewScriptObject(cx, script)));
        CHECK_SAME(second_script_object.value(), script_object.value());

        JS_GC(cx);

        /* After a garbage collection, the script should still work. */
        jsval result;
        CHECK(JS_ExecuteScript(cx, global, script, &result));

        /* JS_DestroyScript must still be safe to call, whether or not it
           actually has any effect. */
        JS_DestroyScript(cx, script);

        return true;
    }
};

const char ScriptObjectFixture::code[] =
    "(function(a, b){return a+' '+b;}('hello', 'world'))";
const int ScriptObjectFixture::code_size = sizeof(ScriptObjectFixture::code) - 1;
jschar ScriptObjectFixture::uc_code[ScriptObjectFixture::code_size];

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_CompileScript)
{
    return tryScript(JS_CompileScript(cx, global, code, code_size,
                                      __FILE__, __LINE__));
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_CompileScript)

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_CompileScript_empty)
{
    return tryScript(JS_CompileScript(cx, global, "", 0,
                                      __FILE__, __LINE__));
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_CompileScript_empty)

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_CompileScriptForPrincipals)
{
    return tryScript(JS_CompileScriptForPrincipals(cx, global, NULL,
                                                   code, code_size,
                                                   __FILE__, __LINE__));
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_CompileScriptForPrincipals)

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileUCScript)
{
    return tryScript(JS_CompileUCScript(cx, global,
                                        uc_code, code_size,
                                        __FILE__, __LINE__));
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileUCScript)

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileUCScript_empty)
{
    return tryScript(JS_CompileUCScript(cx, global,
                                        uc_code, 0,
                                        __FILE__, __LINE__));
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileUCScript_empty)

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileUCScriptForPrincipals)
{
    return tryScript(JS_CompileUCScriptForPrincipals(cx, global, NULL,
                                                     uc_code, code_size,
                                                     __FILE__, __LINE__));
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileUCScriptForPrincipals)

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileFile)
{
    TempFile tempScript;
    static const char script_filename[] = "temp-bug438633_JS_CompileFile";
    FILE *script_stream = tempScript.open(script_filename);
    CHECK(fputs(code, script_stream) != EOF);
    tempScript.close();
    JSScript *script = JS_CompileFile(cx, global, script_filename);
    tempScript.remove();
    return tryScript(script);
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileFile)

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileFile_empty)
{
    TempFile tempScript;
    static const char script_filename[] = "temp-bug438633_JS_CompileFile_empty";
    tempScript.open(script_filename);
    tempScript.close();
    JSScript *script = JS_CompileFile(cx, global, script_filename);
    tempScript.remove();
    return tryScript(script);
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileFile_empty)

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileFileHandle)
{
    TempFile tempScript;
    FILE *script_stream = tempScript.open("temp-bug438633_JS_CompileFileHandle");
    CHECK(fputs(code, script_stream) != EOF);
    CHECK(fseek(script_stream, 0, SEEK_SET) != EOF);
    return tryScript(JS_CompileFileHandle(cx, global, "temporary file",
                                          script_stream));
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileFileHandle)

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileFileHandle_empty)
{
    TempFile tempScript;
    FILE *script_stream = tempScript.open("temp-bug438633_JS_CompileFileHandle_empty");
    return tryScript(JS_CompileFileHandle(cx, global, "empty temporary file",
                                          script_stream));
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileFileHandle_empty)

BEGIN_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileFileHandleForPrincipals)
{
    TempFile tempScript;
    FILE *script_stream = tempScript.open("temp-bug438633_JS_CompileFileHandleForPrincipals");
    CHECK(fputs(code, script_stream) != EOF);
    CHECK(fseek(script_stream, 0, SEEK_SET) != EOF);
    return tryScript(JS_CompileFileHandleForPrincipals(cx, global,
                                                       "temporary file",
                                                       script_stream, NULL));
}
END_FIXTURE_TEST(ScriptObjectFixture, bug438633_JS_CompileFileHandleForPrincipals)

BEGIN_TEST(testScriptObject_ScriptlessScriptObjects)
{
    /* JS_NewScriptObject(cx, NULL) should return a fresh object each time. */
    jsvalRoot script_object1(cx, OBJECT_TO_JSVAL(JS_NewScriptObject(cx, NULL)));
    CHECK(!JSVAL_IS_PRIMITIVE(script_object1.value()));

    jsvalRoot script_object2(cx, OBJECT_TO_JSVAL(JS_NewScriptObject(cx, NULL)));
    CHECK(!JSVAL_IS_PRIMITIVE(script_object2.value()));

    if (script_object1.value() == script_object2.value())
        return false;

    return true;
}
END_TEST(testScriptObject_ScriptlessScriptObjects)
