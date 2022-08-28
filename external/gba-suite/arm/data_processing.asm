data_processing:
        ; Tests for the data processing instruction

t200:
        ; ARM 3: Move
        mov     r0, 32
        cmp     r0, 32
        bne     f200

        b       t201

f200:
        failed  200

t201:
        ; ARM 3: Move negative
        mvn     r0, 0
        adds    r0, 1
        bne     f201

        b       t202

f201:
        failed  201

t202:
        ; ARM 3: And
        mov     r0, 0xFF
        and     r0, 0x0F
        cmp     r0, 0x0F
        bne     f202

        b       t203

f202:
        failed  202

t203:
        ; ARM 3: Exclusive or
        mov     r0, 0xFF
        eor     r0, 0xF0
        cmp     r0, 0x0F
        bne     f203

        b       t204

f203:
        failed  203

t204:
        ; ARM 3: Or
        mov     r0, 0xF0
        orr     r0, 0x0F
        cmp     r0, 0xFF
        bne     f204

        b       t205

f204:
        failed  204

t205:
        ; ARM 3: Bit clear
        mov     r0, 0xFF
        bic     r0, 0x0F
        cmp     r0, 0xF0
        bne     f205

        b       t206

f205:
        failed  205

t206:
        ; ARM 3: Add
        mov     r0, 32
        add     r0, 32
        cmp     r0, 64
        bne     f206

        b       t207

f206:
        failed  206

t207:
        ; ARM 3: Add with carry
        msr     cpsr_f, 0
        movs    r0, 32
        adc     r0, 32
        cmp     r0, 64
        bne     f207

        msr     cpsr_f, FLAG_C
        mov     r0, 32
        adc     r0, 32
        cmp     r0, 65
        bne     f207

        b       t208

f207:
        failed  207

t208:
        ; ARM 3: Subtract
        mov     r0, 64
        sub     r0, 32
        cmp     r0, 32
        bne     f208

        b       t209

f208:
        failed  208

t209:
        ; ARM 3: Reverse subtract
        mov     r0, 32
        rsb     r0, 64
        cmp     r0, 32
        bne     f209

        b       t210

f209:
        failed  209

t210:
        ; ARM 3: Subtract with carry
        msr     cpsr_f, 0
        mov     r0, 64
        sbc     r0, 32
        cmp     r0, 31
        bne     f210

        msr     cpsr_f, FLAG_C
        mov     r0, 64
        sbc     r0, 32
        cmp     r0, 32
        bne     f210

        b       t211

f210:
        failed  210

t211:
        ; ARM 3: Reverse subtract with carry
        msr     cpsr_f, 0
        mov     r0, 32
        rsc     r0, 64
        cmp     r0, 31
        bne     f211

        msr     cpsr_f, FLAG_C
        mov     r0, 32
        rsc     r0, 64
        cmp     r0, 32
        bne     f211

        b       t212

f211:
        failed  211

t212:
        ; ARM 3: Compare
        mov     r0, 32
        cmp     r0, r0
        bne     f212

        b       t213

f212:
        failed  212

t213:
        ; ARM 3: Compare negative
        mov     r0, 1 shl 31
        cmn     r0, r0
        bne     f213

        b       t214

f213:
        failed  213

t214:
        ; ARM 3: Test
        mov     r0, 0xF0
        tst     r0, 0x0F
        bne     f214

        b       t215

f214:
        failed  214

t215:
        ; ARM 3: Test equal
        mov     r0, 0xFF
        teq     r0, 0xFF
        bne     f215

        b       t216

f215:
        failed  215

t216:
        ; ARM 3: Operand types
        mov     r0, 0xFF00
        mov     r1, 0x00FF
        mov     r1, r1, lsl 8
        cmp     r1, r0
        bne     f216

        b       t217

f216:
        failed  216

t217:
        ; ARM 3: Update carry for rotated immediate
        movs    r0, 0xF000000F
        bcc     f217

        movs    r0, 0x0FF00000
        bcs     f217

        b       t218

f217:
        failed  217

t218:
        ; ARM 3: Update carry for rotated register
        mov     r0, 0xFF
        mov     r1, 4
        movs    r2, r0, ror r1
        bcc     f218

        mov     r0, 0xF0
        mov     r1, 4
        movs    r2, r0, ror r1
        bcs     f218

        b       t219

f218:
        failed  218

t219:
        ; ARM 3: Update carry for rotated register
        mov     r0, 0xFF
        movs    r1, r0, ror 4
        bcc     f219

        mov     r0, 0xF0
        movs    r1, r0, ror 4
        bcs     f219

        b       t220

f219:
        failed  219

t220:
        ; ARM 3: Register shift special
        mov     r0, 0
        msr     cpsr_f, FLAG_C
        movs    r0, r0, rrx
        bcs     f220
        cmp     r0, 1 shl 31
        bne     f220

        b       t221

f220:
        failed  220

t221:
        ; ARM 3: PC as operand
        add     r0, pc, 4
        cmp     r0, pc
        bne     f221

        b       t222

f221:
        failed  221

t222:
        ; ARM 3: PC as destination
        adr     r0, t223
        mov     pc, r0

f222:
        failed  222

t223:
        ; ARM 3: PC as destination with S bit
        mov     r8, 32
        msr     cpsr, MODE_FIQ
        mov     r8, 64
        msr     spsr, MODE_SYS
        subs    pc, 4
        cmp     r8, 32
        bne     f223

        b       t224

f223:
        failed  223

t224:
        ; ARM 3: PC as shifted register
        mov     r0, 0
        dw      0xE1A0001F  ; mov r0, pc, lsl r0
        cmp     r0, pc
        bne     f224

        b       t225

f224:
        failed  224

t225:
        ; ARM 3: PC as operand 1 with shifted register
        mov     r0, 0
        dw      0xE08F0010  ; add r0, pc, r0, lsl r0
        cmp     r0, pc
        bne     f225

        b       t226

f225:
        failed  225

t226:
        ; ARM 3: PC as operand 1 with shifted register with immediate shift amount
        mov     r0, 0
        mov     r2, lr
        bl      _get_pc_226
_get_pc_226:
        mov     r1, lr
        mov     lr, r2

        add     r0, pc, r0
        add     r1, 16
        cmp     r1, r0
        bne     f226

        b       t227
f226:
        failed  226

t227:
        ; ARM 3: Rotated immediate logical operation
        msr     cpsr_f, 0
        movs    r0, 0x80000000
        bcc     f227
        bpl     f227

        b       t228

f227:
        failed  227

t228:
        ; ARM 3: Rotated immediate arithmetic operation
        msr     cpsr_f, FLAG_C
        mov     r0, 0
        adcs    r0, 0x80000000
        cmp     r0, 0x80000001
        bne     f228

        msr     cpsr_f, FLAG_C
        mov     r0, 0
        adcs    r0, 0x70000000
        cmp     r0, 0x70000001
        bne     f228

        b       t229

f228:
        failed  228

t229:
        ; ARM 3: Immediate shift logical operation
        msr     cpsr_f, 0
        mov     r0, 0x80
        movs    r0, r0, ror 8
        bcc     f229
        bpl     f229


        b       t230

f229:
        failed  229

t230:
        ; ARM 3: Immediate shift arithmetic operation
        msr     cpsr_f, FLAG_C
        mov     r0, 0
        mov     r1, 0x80
        adcs    r0, r1, ror 8
        cmp     r0, 0x80000001
        bne     f230

        msr     cpsr_f, FLAG_C
        mov     r0, 0
        mov     r1, 0x70
        adcs    r0, r1, ror 8
        cmp     r0, 0x70000001
        bne     f230

        b       t231

f230:
        failed  230

t231:
        ; ARM 3: Register shift logical operation
        msr     cpsr_f, 0
        mov     r0, 0x80
        mov     r1, 8
        movs    r0, r0, ror r1
        bcc     f231
        bpl     f231

        b       t232

f231:
        failed  231

t232:
        ; ARM 3: Register shift arithmetic operation
        msr     cpsr_f, FLAG_C
        mov     r0, 0
        mov     r1, 0x80
        mov     r2, 8
        adcs    r0, r1, ror r2
        cmp     r0, 0x80000001
        bne     f232

        msr     cpsr_f, FLAG_C
        mov     r0, 0
        mov     r1, 0x70
        mov     r2, 8
        adcs    r0, r1, ror r2
        cmp     r0, 0x70000001
        bne     f232

        b       t233

f232:
        failed  232

t233:
        ; ARM 3: TST / TEQ setting flags during shifts
        msr     cpsr_f, 0
        tst     r0, 0x80000000
        bcc     f233

        msr     cpsr_f, 0
        teq     r0, 0x80000000
        bcc     f233

        b       data_processing_passed

f233:
        failed  233

data_processing_passed:
