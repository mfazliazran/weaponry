/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Communicator client code, released
 * March 31, 1998.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#ifndef jsregexp_h___
#define jsregexp_h___
/*
 * JS regular expression interface.
 */
#include <stddef.h>
#include "jsprvtd.h"
#include "jsstr.h"
#include "jscntxt.h"
#include "jsvector.h"

#ifdef JS_THREADSAFE
#include "jsdhash.h"
#endif

extern js::Class js_RegExpClass;

namespace js {

class RegExpStatics
{
    typedef Vector<int, 20, SystemAllocPolicy> MatchPairs;
    MatchPairs  matchPairs;
    JSString    *input;
    uintN       flags;

    bool createDependent(JSContext *cx, size_t start, size_t end, Value *out) const;

    size_t pairCount() const {
        JS_ASSERT(matchPairs.length() % 2 == 0);
        return matchPairs.length() / 2;
    }
    /*
     * Check whether the index at |checkValidIndex| is valid (>= 0).
     * If so, construct a string for it and place it in |*out|.
     * If not, place undefined in |*out|.
     */
    bool makeMatch(JSContext *cx, size_t checkValidIndex, size_t pairNum, Value *out) const;
    static const uintN allFlags = JSREG_FOLD | JSREG_GLOB | JSREG_STICKY | JSREG_MULTILINE;
    friend class RegExp;

  public:
    explicit RegExpStatics() { clear(); }
    void clone(const RegExpStatics &other);
    static RegExpStatics *extractFrom(JSObject *global);

    /* Mutators. */

    void setMultiline(bool enabled) {
        if (enabled)
            flags = flags | JSREG_MULTILINE;
        else
            flags = flags & ~JSREG_MULTILINE;
    }

    void clear() {
        input = 0;
        flags = 0;
        matchPairs.clear();
    }

    void checkInvariants() {
        if (pairCount() > 0) {
            JS_ASSERT(input);
            JS_ASSERT(get(0, 0) <= get(0, 1));
            JS_ASSERT(get(0, 1) <= int(input->length()));
        }
    }

    void reset(JSString *newInput, bool newMultiline) {
        clear();
        input = newInput;
        setMultiline(newMultiline);
        checkInvariants();
    }

    void setInput(JSString *newInput) {
        input = newInput;
    }

    /* Accessors. */

    JSString *getInput() const { return input; }
    uintN getFlags() const { return flags; }
    bool multiline() const { return flags & JSREG_MULTILINE; }
    bool matched() const { JS_ASSERT(pairCount() > 0); return get(0, 1) - get(0, 0) > 0; }
    size_t getParenCount() const { JS_ASSERT(pairCount() > 0); return pairCount() - 1; }

    void mark(JSTracer *trc) const {
        if (input)
            JS_CALL_STRING_TRACER(trc, input, "res->input");
    }

    size_t getParenLength(size_t parenNum) const {
        if (pairCount() <= parenNum + 1)
            return 0;
        return get(parenNum + 1, 1) - get(parenNum + 1, 0);
    }

    int get(size_t pairNum, bool which) const {
        JS_ASSERT(pairNum < pairCount());
        return matchPairs[2 * pairNum + which];
    }

    /* Value creators. */

    bool createInput(JSContext *cx, Value *out) const;
    bool createLastMatch(JSContext *cx, Value *out) const { return makeMatch(cx, 0, 0, out); }
    bool createLastParen(JSContext *cx, Value *out) const;
    bool createLeftContext(JSContext *cx, Value *out) const;
    bool createRightContext(JSContext *cx, Value *out) const;

    bool createParen(JSContext *cx, size_t parenNum, Value *out) const {
        return makeMatch(cx, (parenNum + 1) * 2, parenNum + 1, out);
    }

    /* Substring creators. */

    void getParen(size_t num, JSSubString *out) const;
    void getLastMatch(JSSubString *out) const;
    void getLastParen(JSSubString *out) const;
    void getLeftContext(JSSubString *out) const;
    void getRightContext(JSSubString *out) const;
};

}

static inline bool
VALUE_IS_REGEXP(JSContext *cx, js::Value v)
{
    return !v.isPrimitive() && v.toObject().isRegExp();
}

inline const js::Value &
JSObject::getRegExpLastIndex() const
{
    JS_ASSERT(isRegExp());
    return fslots[JSSLOT_REGEXP_LAST_INDEX];
}

inline void
JSObject::setRegExpLastIndex(const js::Value &v)
{
    JS_ASSERT(isRegExp());
    fslots[JSSLOT_REGEXP_LAST_INDEX] = v;
}

inline void
JSObject::setRegExpLastIndex(jsdouble d)
{
    JS_ASSERT(isRegExp());
    fslots[JSSLOT_REGEXP_LAST_INDEX] = js::NumberValue(d);
}

inline void
JSObject::zeroRegExpLastIndex()
{
    JS_ASSERT(isRegExp());
    fslots[JSSLOT_REGEXP_LAST_INDEX].setInt32(0);
}

namespace js { class AutoStringRooter; }

inline bool
JSObject::isRegExp() const
{
    return getClass() == &js_RegExpClass;
}

extern JS_FRIEND_API(JSBool)
js_ObjectIsRegExp(JSObject *obj);

extern JSObject *
js_InitRegExpClass(JSContext *cx, JSObject *obj);

/*
 * Export js_regexp_toString to the decompiler.
 */
extern JSBool
js_regexp_toString(JSContext *cx, JSObject *obj, js::Value *vp);

extern JS_FRIEND_API(JSObject *) JS_FASTCALL
js_CloneRegExpObject(JSContext *cx, JSObject *obj, JSObject *proto);

/*
 * Move data from |cx|'s regexp statics to |statics| and root the input string in |tvr| if it's
 * available.
 */
extern JS_FRIEND_API(void)
js_SaveAndClearRegExpStatics(JSContext *cx, js::RegExpStatics *res, js::AutoStringRooter *tvr);

/* Move the data from |statics| into |cx|. */
extern JS_FRIEND_API(void)
js_RestoreRegExpStatics(JSContext *cx, js::RegExpStatics *res);

extern JSBool
js_XDRRegExpObject(JSXDRState *xdr, JSObject **objp);

extern JSBool
js_regexp_exec(JSContext *cx, uintN argc, js::Value *vp);
extern JSBool
js_regexp_test(JSContext *cx, uintN argc, js::Value *vp);

#endif /* jsregexp_h___ */
