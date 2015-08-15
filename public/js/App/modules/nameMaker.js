var Base64 = require('./base64');

var nameMaker = function(charMapSrc, onLoadFunction) {
    this.initialized = false;
    this.charmap = new Image();
    this.charmap.onload = function () {
        this.initialized = true;
        if (onLoadFunction !== undefined)
            onLoadFunction();
    }
    this.charmap.src = charMapSrc;
}

nameMaker.prototype.writeName = function (ctx, base64String, height) {

    ctx.clearRect(0, 0, 500, 500);

    // Characters across
    var hCh = 16;
    // Characters vertical
    var vCh = 16;

    var height_of_chars = height || 16;

    var orig_char_px_width = this.charmap.width / hCh;
    var orig_char_px_height = this.charmap.height / vCh;

    var scale = height_of_chars / orig_char_px_height;


    var v_px = height_of_chars;
    var h_px = scale * orig_char_px_width;

    var binary_name = Base64.decode(base64String);;
    var name_length = binary_name.length;

    for (var i = 0; i < name_length; i++) {

        //$byte_char = ord($binary_name[$i]);

        var name_char = binary_name.charCodeAt(i);

        var v_char_offset = name_char >> 4;
        var h_char_offset = name_char & 0x0F;

        //ctx.drawImage(charmap, sx, sy, sw, sh, dx, dy, dw, dh)
        ctx.drawImage(this.charmap,
                        h_char_offset * orig_char_px_width,
                        v_char_offset * orig_char_px_height,
                        orig_char_px_width,
                        orig_char_px_height,
                        i * h_px,
                        0,
                        h_px,
                        v_px);
        //            $char = $charmap->getImageRegion(
        //                            $h_px,
        //                            $v_px,
        //                            $h_char_offset * $h_px,
        //                            $v_char_offset * $v_px);
        //                           //$i*$h_px,
        //                            //);
        //
        //            $chars->compositeImage($char, Imagick::COMPOSITE_DEFAULT, $i*$h_px, 0);

    }

    //Make background transparent
    //        $chars->paintTransparentImage($chars->getImagePixelColor(0,0),0.0,0);

}

function size(pWidth, pHeight) {
    this.width = pWidth;
    this.height = pHeight;
}

module.exports = nameMaker;
