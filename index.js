"use strict";

var $ = require('jquery');

$(document)

/**
 * Trigger validation for pre-filled fields
 */
.ready(function() {
    $('.field input, .field textarea').each(function() {
        if (this.value.length > 0) $(this).change();
    })
})

/**
 * show modals windows
 * tag a button/link with modal='name'
 * tag a modal with modal-name
 */
.on('click', '[modal]', function(e) {
    var label = this.getAttribute('modal');
    $('.modal[modal-' + label + ']').addClass('is-active');
})

/**
 * Remove modals on background/delete clicks
 */
.on('click', '.modal-background, .modal .delete', function(e) {
    $('.modal').removeClass('is-active');
})

/**
 * Convert file input into base64 on select
 * also perform success/error CSS
 */
.on('change', '.field input[on-read]', function(e) {
    var file = this.files[0],
        attr = this.getAttribute('on-read'),
        reader = new FileReader();

    if (file) {
        $(this).parent().find('.file-name')
        .text(file.name)
        .addClass('is-success');

        reader.onload = function() {
            $('[name=\'' + attr + '\']').val(reader.result);
        }
        reader.readAsDataURL(file);
    }
})

/**
 * Update validity styles on input changes
 */
.on('change', '.field input, .field textarea', function(e) {
    if (this.validity.valid) {
        $(this)
        .addClass('is-success')
        .removeClass('is-danger');
    } else {
        $(this)
        .addClass('is-danger')
        .removeClass('is-success');
    }
})

/**
 *
 */
.on('change', '.field select', function(e) {
    if (this.value.length > 0) {
        $(this).parent()
        .addClass('is-success')
        .removeClass('is-danger');
    } else {
        $(this).parent()
        .addClass('is-danger')
        .removeClass('is-success');
    }
})

/**
 * Submit form
 * attributes:
 * - action          - endpoint url
 * - method          - POST/GET/PUT
 * - on-start        - callback(data{})
 * - on-success      - callback(data{})
 * - on-error        - callback(data{})
 * - on-modify       - callback(data{})
 *
 * TODO explain the callbacks
 */
.on('submit', 'form', function(e) {
    e.preventDefault();
    var onstart   = window[this.getAttribute('on-start')],
        onsuccess = window[this.getAttribute('on-success')],
        onerror   = window[this.getAttribute('on-error')],
        onmodify  = window[this.getAttribute('on-modify')],
        elements  = this.elements,
        fields    = {};
    
    forElements(elements, function(element) {
        fields[element.name] = element.value;
        element.setAttribute('disabled', 'true');
    })
    
    if (onstart) {
        onstart(this);
    }
    
    if (onmodify) {
        onmodify(fields);
    }
    
    $.ajax({
        method: this.method || 'POST',
        url: this.action,
        data: fields,
    })
    .then(function(response) {
        if (onsuccess && response.result !== "error") {
            onsuccess(response);
        }
        // TODO remove this
        else if (response.result === "error") {
            console.log(response);
            if (onerror) onerror(response);
            
            forElements(elements, function(element) {
                element.removeAttribute('disabled');
            });
        }
    })
    .catch(function(err) {
        // TODO what type is err?
        console.log(err);
        if (onerror) onerror(err);
        
        forElements(elements, function(element) {
            element.removeAttribute('disabled');
        });
    });
})

// cross-browser loop through HTMLCollection
function forElements(elements, fn) {
    for (var i=elements.length >>> 0; i--;) {
        fn(elements[i]);
    }
}
